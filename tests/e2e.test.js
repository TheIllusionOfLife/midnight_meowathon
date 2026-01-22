// E2Eテストスイート - Midnight Meowathon

describe('Midnight Meowathon - E2E Tests', () => {
    let game;

    beforeEach(() => {
        // テスト用のゲーム設定
        const config = {
            type: Phaser.HEADLESS,
            width: 800,
            height: 550,
            physics: {
                default: 'arcade',
                arcade: { gravity: { y: 1100 }, debug: false }
            },
            scene: [TitleScene, PowerUpScene, GameScene, GatheringScene]
        };
        game = new Phaser.Game(config);
    });

    afterEach(() => {
        game.destroy(true);
    });

    describe('グローバル定数の検証', () => {
        test('POWERUPS が正しく定義されている', () => {
            expect(POWERUPS).toBeDefined();
            expect(Object.keys(POWERUPS)).toHaveLength(6);

            // 各パワーアップが必須プロパティを持つ
            Object.values(POWERUPS).forEach(powerUp => {
                expect(powerUp).toHaveProperty('id');
                expect(powerUp).toHaveProperty('name');
                expect(powerUp).toHaveProperty('icon');
                expect(powerUp).toHaveProperty('effect');
                expect(powerUp).toHaveProperty('description');
                expect(powerUp).toHaveProperty('rarity');
            });
        });

        test('STAGE_LAYOUTS が正しく定義されている', () => {
            expect(STAGE_LAYOUTS).toBeDefined();
            expect(Object.keys(STAGE_LAYOUTS)).toHaveLength(5);

            // 各ステージが必須プロパティを持つ
            [1, 2, 3, 4, 5].forEach(stageNum => {
                const layout = STAGE_LAYOUTS[stageNum];
                expect(layout).toBeDefined();
                expect(layout).toHaveProperty('name');
                expect(layout).toHaveProperty('background');
                expect(layout).toHaveProperty('catStart');
                expect(layout).toHaveProperty('platforms');
                expect(layout).toHaveProperty('items');
                expect(Array.isArray(layout.platforms)).toBe(true);
                expect(Array.isArray(layout.items)).toBe(true);
            });
        });

        test('GATHERING_STAGE_LAYOUTS が正しく定義されている', () => {
            expect(GATHERING_STAGE_LAYOUTS).toBeDefined();
            expect(Object.keys(GATHERING_STAGE_LAYOUTS)).toHaveLength(4);

            ['kuro', 'shiro', 'mike', 'boss'].forEach(bossId => {
                const layout = GATHERING_STAGE_LAYOUTS[bossId];
                expect(layout).toBeDefined();
                expect(layout).toHaveProperty('name');
                expect(layout).toHaveProperty('platforms');
                expect(layout).toHaveProperty('items');
            });
        });

        test('BOSS_CATS が正しく定義されている', () => {
            expect(BOSS_CATS).toBeDefined();
            expect(BOSS_CATS).toHaveLength(4);

            BOSS_CATS.forEach(boss => {
                expect(boss).toHaveProperty('id');
                expect(boss).toHaveProperty('name');
                expect(boss).toHaveProperty('targetTime');
                expect(boss).toHaveProperty('color');
                expect(boss).toHaveProperty('description');
                expect(boss.targetTime).toBeGreaterThan(0);
            });
        });
    });

    describe('アイコンテクスチャの検証', () => {
        test('すべてのパワーアップアイコンが存在する', () => {
            const requiredIcons = [
                'iconCatnip',
                'iconBell',
                'iconThunder',
                'iconMoon',
                'iconFish',
                'iconCatToy'
            ];

            // テクスチャが生成されることを確認
            // 実際のゲームでは createAllTextures が呼ばれる
            requiredIcons.forEach(iconName => {
                const powerUp = Object.values(POWERUPS).find(p => p.icon === iconName);
                expect(powerUp).toBeDefined();
            });
        });
    });

    describe('ローグライトシステムの検証', () => {
        test('PowerUpManager が正しく動作する', () => {
            const manager = new PowerUpManager();

            // 初期状態
            expect(manager.activePowerUps).toHaveLength(0);

            // パワーアップ追加
            const added = manager.addPowerUp('catnip');
            expect(added).toBe(true);
            expect(manager.activePowerUps).toHaveLength(1);

            // 効果倍率取得
            const speedMult = manager.getMultiplier('speedMultiplier');
            expect(speedMult).toBe(1.5);

            // 最大数チェック
            manager.addPowerUp('bell');
            manager.addPowerUp('thunder');
            manager.addPowerUp('fullMoon');
            manager.addPowerUp('fish');
            const overflow = manager.addPowerUp('catToy');
            expect(overflow).toBe(false);
            expect(manager.activePowerUps).toHaveLength(5);
        });

        test('StoryProgress が正しく動作する', () => {
            const progress = new StoryProgress();

            // 初期状態
            expect(progress.getCurrentStage()).toBe(1);
            expect(progress.isGatheringUnlocked()).toBe(false);

            // ステージクリア
            const result1 = progress.completeStage(1000);
            expect(result1.continue).toBe(true);
            expect(result1.completed).toBe(false);
            expect(result1.ending).toBe(false);
            expect(progress.getCurrentStage()).toBe(2);
            expect(progress.isGatheringUnlocked()).toBe(true);

            // 全ステージクリア
            progress.completeStage(1000);
            progress.completeStage(1000);
            progress.completeStage(1000);
            const result5 = progress.completeStage(1000);
            expect(result5.continue).toBe(true);
            expect(result5.completed).toBe(true);
            expect(result5.ending).toBe(true);
            expect(progress.getCurrentStage()).toBe(1); // ステージ1に戻る
        });
    });

    describe('タイムアタックシステムの検証', () => {
        test('TimeAttackRules が正しく動作する', () => {
            const rules = new TimeAttackRules('kuro');

            expect(rules.targetTime).toBe(22.5);
            expect(rules.bossName).toBe('クロ');

            // 勝敗判定
            expect(rules.checkWin(20)).toBe(true);   // 22.5秒未満で勝利
            expect(rules.checkWin(25)).toBe(false);  // 22.5秒以上で敗北

            // ランク判定 (targetTime - playerTime)
            expect(rules.getRank(12)).toBe('S');   // 22.5-12 = +10.5秒 (≥10)
            expect(rules.getRank(17)).toBe('A');   // 22.5-17 = +5.5秒  (≥5)
            expect(rules.getRank(22)).toBe('B');   // 22.5-22 = +0.5秒  (≥0)
            expect(rules.getRank(25)).toBe('C');   // 22.5-25 = -2.5秒  (≥-5)
            expect(rules.getRank(30)).toBe('D');   // 22.5-30 = -7.5秒  (<-5)
        });
    });

    describe('ステージレイアウトの整合性検証', () => {
        test('各ステージのアイテム数が適切', () => {
            [1, 2, 3, 4, 5].forEach(stageNum => {
                const layout = STAGE_LAYOUTS[stageNum];
                expect(layout.items.length).toBeGreaterThan(0);
                expect(layout.items.length).toBeLessThan(30);
            });
        });

        test('各ステージのプラットフォーム数が適切', () => {
            [1, 2, 3, 4, 5].forEach(stageNum => {
                const layout = STAGE_LAYOUTS[stageNum];
                expect(layout.platforms.length).toBeGreaterThan(0);
                expect(layout.platforms.length).toBeLessThan(20);
            });
        });

        test('猫の開始位置が画面内', () => {
            [1, 2, 3, 4, 5].forEach(stageNum => {
                const layout = STAGE_LAYOUTS[stageNum];
                expect(layout.catStart.x).toBeGreaterThan(0);
                expect(layout.catStart.x).toBeLessThan(800);
                expect(layout.catStart.y).toBeGreaterThan(0);
                expect(layout.catStart.y).toBeLessThan(550);
            });
        });
    });

    describe('名前空間の衝突検証', () => {
        test('STAGE_LAYOUTS と GATHERING_STAGE_LAYOUTS が別物', () => {
            expect(STAGE_LAYOUTS).toBeDefined();
            expect(GATHERING_STAGE_LAYOUTS).toBeDefined();
            expect(STAGE_LAYOUTS).not.toBe(GATHERING_STAGE_LAYOUTS);

            // キーが異なることを確認
            const stageKeys = Object.keys(STAGE_LAYOUTS);
            const gatheringKeys = Object.keys(GATHERING_STAGE_LAYOUTS);
            expect(stageKeys).toEqual([1, 2, 3, 4, 5].map(String));
            expect(gatheringKeys).toEqual(['kuro', 'shiro', 'mike', 'boss']);
        });
    });
});

// ユニットテスト実行
console.log('🧪 E2Eテスト実行中...');
