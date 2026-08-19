# thirdExec/seisground-weights

## Resumen

SeisGround es un sistema de vision-lenguaje especializado en la interpretacion de fallas sismicas, desarrollado por thirdExec. Combina un encoder sismico congelado (Seismic Foundation Model, ViT-B/16 a resolucion 512), un lector DETR con 48 consultas que mide la geometria de las fallas (numero, ubicacion, buzamiento, salto y mascara por falla), y un modelo de lenguaje Qwen2.5-1.5B-Instruct afinado con LoRA que genera narraciones etiquetadas. La innovacion central es el "digit-copy seam": un mecanismo no diferenciable que obliga al texto a copiar los valores medidos por el lector visual, impidiendo que el LM invente cifras.

El entrenamiento se organiza en tres etapas: un adaptador LoRA de geologia sobre GeoGPT-CoT-QA, un adaptador de grounding que ensena al narrador a leer la salida del lector, y el narrador final desplegado. Los pesos publicados incluyen el lector base sintetico, los adaptadores de las etapas 2 y 3, y los pesos del experimento A/B con datos reales. El repositorio pesa 0.9 GB y contiene exclusivamente adaptadores y pesos del lector; el encoder sismico es un componente de terceros que debe descargarse por separado.

La relevancia del modelo radica en que aborda un problema critico de los VLM: la alucinacion de valores numericos en dominios cientificos. Al separar la medicion (vision) de la narracion (lenguaje) mediante un seam no diferenciable, garantiza que el texto solo afirme lo que el sistema realmente midio, con metricas de fidelidad publicadas (0.77-0.89 de copia y CHAIR_I de 0.185).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: SFM-Base-512 (ViT-B/16, congelado) + lector DETR (48 consultas, asignacion hungara) + Qwen2.5-1.5B-Instruct con LoRA |
| Parametros totales | no disponible (el repositorio contiene adaptadores LoRA y pesos del lector; el LM base tiene 1.500 millones y el encoder ViT-B/16 unos 86 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct, 32.768 tokens) |
| Tipos de cuantizacion | 4-bit (entrenamiento del adaptador de geologia, r16/α16); el resto no especificado |
| Idiomas soportados | ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y .pt (PyTorch) |

## Arquitectura y entrenamiento

El pipeline completo es: encoder sismico congelado SFM-Base-512 (ViT-B/16, profundidad 12, patch 16, imagen 512, grid 32) → lector DETR con 48 consultas y asignacion hungara que mide numero de fallas, ubicacion, buzamiento, salto y mascara por falla → seam de copia de digitos no diferenciable → narrador Qwen2.5-1.5B-Instruct con LoRA. El encoder se usa congelado y sin modificar, y no se incluye en el repositorio.

El entrenamiento usa perdida Focal-Tversky (α0.4, β0.6, γ1.0, POS_WEIGHT_MAX 15, clDice 1.0) y DILATE_R 0 (mascaras puras con suelo de 16 px). El adaptador de geologia (etapa 1) se entrena con r16/α16, lr 2e-5 y cuantizacion 4-bit sobre GeoGPT-CoT-QA, y queda congelado despues. El lector se entrena con lr 1e-4. Los datos incluyen VQA sismico sintetico (1.261 escenas, 1.320 regiones), GeoGPT-CoT-QA, Thebe (37.796 parches), CRACKS (397) y Smeaheia (430, cubo 3D GN1101). El experimento A/B compara un adaptador conjunto 1:1:1 con supervision real de buzamiento/salto (B_joint, desplegado) frente a un control sin esa supervision (A_joint), ambos sobre un lector base sintetico fresco.

La innovacion tecnica principal es el seam de copia de digitos: un punto no diferenciable en el pipeline que impide que el LM genere valores que no provengan de las mediciones del lector. Esto garantiza fidelidad factual en la narracion, con una tasa de deteccion de swaps de buzamiento de 16/16.

## Capacidades

- Interpretacion de fallas sismicas: cuenta, ubicacion, buzamiento, salto y mascara por falla.
- Narracion etiquetada con grounding: el texto copia los valores medidos por el lector visual mediante el digit-copy seam.
- Razonamiento geologico: el adaptador de geologia proporciona un andamiaje de razonamiento con formato thinking/<answer>.
- Generacion de texto en ingles.
- Inferencia sobre imagenes propias (secciones sismicas) mediante el script hybrid.infer.
- Variante de narrador con pliegue response→<answer> (stage3_answer.pt) para ablation.
- No soporta tool calling ni funciones de agente.
- No es multilingue (solo ingles).

## Casos de uso

- Interpretacion sismica asistida en geofisica: el modelo analiza secciones sismicas 2D y produce informes etiquetados con la geometria de fallas medida, reduciendo el trabajo manual de interpretacion estructural.
- Deteccion y caracterizacion de fallas en exploracion de hidrocarburos: identifica ubicacion, buzamiento y salto de fallas en cubos sismicos, informacion critica para modelos de trampas estructurales y planificacion de pozos.
- Almacenamiento geologico de CO2: el dataset Smeaheia (cubo GN1101) se usa para validar la interpretacion de fallas en contextos de secuestro de CO2, donde la integridad de sellos y fallas es critica para la seguridad del almacenamiento.
- Generacion automatizada de informes geologicos: el narrador produce descripciones textuales de secciones sismicas con valores numericos verificados, listas para integrarse en informes tecnicos o bases de datos documentales.
- Validacion cruzada de interpretaciones humanas: el modelo puede usarse como segunda opinion para verificar interpretaciones manuales de fallas, comparando mascaras y atributos medidos.
- Investigacion en grounding de VLM para dominios cientificos: el diseno del digit-copy seam constituye un caso de estudio para evitar alucinaciones numericas en modelos de vision-lenguaje aplicados a ciencia e ingenieria.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | Valor |
|---|---|
| IoU agrupado (lector sintetico) | 0.230 |
| F1 de deteccion (lector sintetico) | 0.433 |
| Precision de clase | 0.93 |
| Error de buzamiento (vs constante 32.19°) | 28.06° |
| Error de salto (vs constante 56.23 ms) | 53.60 ms |
| Fidelidad de copia (GT-inyectado) | 0.77 |
| Fidelidad de copia (pipeline lector) | 0.89 |
| CHAIR_I (alucinacion) | 0.185 |
| Deteccion de swap de buzamiento | 16/16 |
| F1 de deteccion media (B_joint desplegado, 1:1:1) | 0.363 |
| F1 de deteccion media (A_joint control, sin supervision real) | 0.333 |
| F1 de deteccion media (ratios 4:3:3 y 8:1:1, no seleccionados) | 0.166 |

No se proporcionan comparaciones con modelos externos en la informacion disponible.

## Requisitos de hardware

- El LM base (Qwen2.5-1.5B-Instruct) es pequeno: cabe en GPUs de consumo con 4-6 GB de VRAM en cuantizacion 4-bit.
- El encoder SFM-Base-512 (ViT-B/16) anade unos 86 millones de parametros, con requisitos modestos de VRAM adicional.
- Los adaptadores LoRA y los pesos del lector son ligeros: el repositorio completo pesa 0.9 GB.
- No se especifican requisitos exactos de VRAM ni latencia en la informacion disponible.
- Opciones de despliegue: el codigo de inferencia se ejecuta desde el repositorio ModelV2 (github.com/Thirdbot/ModelV2) mediante scripts de Python (hybrid.eval.inference y hybrid.infer); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Una GPU de consumo como RTX 3060 o RTX 4060 con 8-12 GB deberia ser suficiente para inferencia, aunque no esta confirmado por el autor.

## Comparativa con modelos similares

No se dispone de comparaciones directas con modelos alternativos en la informacion proporcionada. El modelo se enmarca en el espacio de VLM geologicos como GeoGPT, pero no hay datos de benchmarks comparativos publicados. A diferencia de VLM genericos (LLaVA, Qwen-VL), SeisGround esta especializado en interpretacion sismica con grounding numerico garantizado mediante el digit-copy seam, a costa de un dominio de aplicacion mucho mas estrecho y de depender de un encoder de terceros no incluido en el repositorio.

## Limitaciones y advertencias

- El encoder sismico (SFM-Base-512) NO esta incluido en el repositorio: es un componente de terceros que debe descargarse por separado desde el repositorio de los autores (shenghanlin/SeismicFoundationModel). Sin el, los pesos publicados no son ejecutables.
- El modelo solo soporta ingles.
- Los datos de entrenamiento son mayoritariamente sinteticos (1.261 escenas); la transferencia a datos reales requiere los adaptadores del experimento A/B, entrenados con volumenes limitados (Thebe, CRACKS, Smeaheia).
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el encoder de terceros puede tener su propia licencia que debe verificarse antes de un despliegue en produccion.
- El modelo puede alucinar en contextos fuera de su dominio de entrenamiento (secciones sismicas); no es un VLM de proposito general.
- La fidelidad de copia es de 0.77-0.89, lo que implica que entre un 11% y un 23% de los valores narrados pueden no coincidir con las mediciones del lector.
- No se documentan sesgos especificos, pero el entrenamiento con datos sinteticos puede introducir sesgos de distribucion frente a datos sismicos reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion limitada y poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thirdExec/seisground-weights
- Codigo y scripts: https://github.com/Thirdbot/ModelV2
- Encoder sismico (terceros): https://github.com/shenghanlin/SeismicFoundationModel
- Paper del encoder: https://arxiv.org/abs/2309.02791
- Dataset sintetico: https://huggingface.co/datasets/thirdExec/synthetic-seismic-vlm
- Dataset GeoGPT-CoT-QA: https://huggingface.co/datasets/GeoGPT-Research-Project/GeoGPT-CoT-QA
- Dataset CRACKS: https://huggingface.co/datasets/gOLIVES/CRACKS
- Dataset Smeaheia: https://co2datashare.org/dataset/smeaheia-dataset
- Dataset Thebe: https://doi.org/10.7910/DVN/YBYGBK
