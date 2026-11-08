# xixibuxixi/StatePlay-Mixed-SF3-KOF98-Dual-RL-Stage2-Checkpoints

## Resumen

StatePlay Mixed SF3 + KOF98 Dual RL — Stage 2 Checkpoints es un repositorio de checkpoints intermedios de un proceso de post-entrenamiento con aprendizaje por refuerzo (RL) sobre un modelo de generacion de video condicionado por estado y accion. Lo publica el usuario xixibuxixi en Hugging Face y forma parte de la familia StatePlay, un world model orientado a la generacion mecanicamente coherente de gameplays de juegos de lucha (Street Fighter III y The King of Fighters '98). El modelo base sobre el que se construye es un backbone Wan de 5B parametros, congelado, que no se duplica en este repositorio.

El repositorio no contiene un modelo autónomo listo para inferencia, sino deltas de RL y checkpoints de reanudacion de la fase Stage 2 (`visual_only`) de la ejecucion `mixed_sf3_kof98_dual_v3`. La contribucion tecnica es de 47.185.920 parametros entrenables distribuidos en 751 tensores aprendidos, que se aplican sobre el backbone Wan 5B mediante un cargador de estado aprendido (`mixed_dual`). El objetivo es permitir a evaluadores comparar las actualizaciones exclusivamente visuales de la fase 2 sin mezclarlas con las de la fase 1.

Su relevancia es acotada pero especifica: sirve como material de reproducibilidad y comparacion para investigacion en RL aplicado a generacion de video, no como modelo de produccion. El entrenamiento seguia en curso cuando se creo la instantanea, por lo que el checkpoint de mayor numero no debe interpretarse como el mejor ni el final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Wan 5B (generacion de video) con adaptadores LoRA y parametrizacion visual de RL; no se detalla la arquitectura interna |
| Parametros totales | 5B en el backbone congelado; 47.185.920 parametros entrenables en Stage 2 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`policy_weights/`) y `.pt` para checkpoints completos (`resume_checkpoints/`) |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone Wan de 5B parametros congelado, sobre el que se aplican deltas de RL. La fase Stage 2 corresponde a la variante `visual_only`, con 751 tensores aprendidos y 47.185.920 parametros entrenables. El esquema de checkpoint es `mixed-dual-checkpoint-v3` y el entrenamiento parte de un modelo SFT previo (`StatePlay-Mixed-SF3-KOF98-5B-step2000`) y de los checkpoints de Stage 1 (`StatePlay-Mixed-SF3-KOF98-Dual-RL-Checkpoints`). Stage 2 comienza en el paso de optimizador 220, cursor 5696.

El repositorio incluye cuatro checkpoints: `phase2_start` (paso 220, cursor 5696), dos ventanas intermedias en el paso 235 y 236 (cursor 6080) y un estado estable en frontera de batch en el paso 236 (cursor 6144). Los checkpoints de ventana y de batch del paso 236 pueden contener tensores de politica identicos pero metadatos de cursor, transaccion y reanudacion distintos. Cada checkpoint cuenta con un recibo de recarga exacta exitosa. No se proporcionan detalles sobre el dataset de entrenamiento, el volumen de tokens, la composicion de datos ni la presencia de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por estado y accion en el dominio de juegos de lucha (Street Fighter III y KOF98).
- Prediccion conjunta de frames de video y cinco variables de estado del juego: temporizador, salud de ambos jugadores y medidores de habilidad de ambos jugadores (según la descripcion del proyecto StatePlay en el resultado de busqueda).
- Post-entrenamiento mediante aprendizaje por refuerzo con actualizaciones limitadas a la parte visual (`visual_only`).
- Aplicacion de deltas LoRA sobre un backbone Wan 5B congelado.
- No se documentan capacidades de tool calling, function calling, agentes, multilingüismo, vision general, audio ni modo thinking.

## Casos de uso

- Reproducibilidad de experimentos de RL en generacion de video: cargar los checkpoints de Stage 2 con el cargador `mixed_dual` para replicar exactamente el estado de entrenamiento en el paso 220, 235 o 236 y comparar resultados entre fases.
- Comparacion de ablasiones visuales: evaluar las diferencias entre el estado `phase2_start` y las ventanas intermedias para aislar el efecto de las actualizaciones exclusivamente visuales.
- Investigacion en world models para videojuegos: usar los checkpoints como base para estudiar la coherencia mecanica de la generacion en juegos de lucha, apoyandose en la prediccion conjunta de estado y frames.
- Reanudacion de entrenamientos: los checkpoints completos en `resume_checkpoints/` incluyen estado de optimizador, RNG, cursor y ledger, lo que permite continuar una ejecucion exacta con el codigo y la configuracion de entrenamiento correspondientes.
- Auditoria de integridad de artefactos: verificar la cadena de custodia mediante `SHA256SUMS.json` y `release_manifest.json` para validar que los tensores publicados coinciden con los del entrenamiento original.
- Desarrollo de pipelines de post-entrenamiento RL sobre backbones de video: servir como referencia de esquema de checkpoint (`mixed-dual-checkpoint-v3`) para disenar sistemas propios de RL con separacion de fases y ledger de transacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone Wan 5B congelado no se incluye en el repositorio, por lo que los requisitos dependen del modelo base completo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. Los archivos de `policy_weights/` son deltas de RL y no modelos Wan 5B fusionados autonomos; requieren construir el modelo StatePlay correspondiente y cargar los tensores mediante el cargador `mixed_dual` de la ejecucion.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 4,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay Mixed SF3 + KOF98 Dual RL Stage 2 (este) | 5B backbone + 47,2M entrenables | no disponible | no disponible | no disponible | Hugging Face, deltas de RL |
| StatePlay-KOF98-MoT-5B-step1250 | 5B (MoE) | no disponible | no disponible | no disponible | Hugging Face |
| StatePlay (onepiece1999) | no disponible | no disponible | no disponible | no disponible | Hugging Face, con paper, codigo y dataset |

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: los archivos de `policy_weights/` son deltas de RL que requieren el backbone Wan 5B y el cargador `mixed_dual` para funcionar.
- Los checkpoints `.pt` completos exigen el codigo de entrenamiento y la configuracion exactos para una reanudacion fiel.
- El entrenamiento seguia en curso al crear la instantanea; el checkpoint de mayor numero no es necesariamente el mejor ni el final.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion y fidelidad de generacion no evaluado en la informacion disponible.
- Dominio muy restringido (juegos de lucha SF3 y KOF98), sin evidencia de generalizacion a otros dominios.
- Cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-Dual-RL-Stage2-Checkpoints
- Modelo SFT base: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-5B-step2000
- Checkpoints de Stage 1: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-Dual-RL-Checkpoints
- Variante MoT: https://huggingface.co/xixibuxixi/StatePlay-KOF98-MoT-5B-step1250
- StatePlay (onepiece1999): https://huggingface.co/onepiece1999/StatePlay
