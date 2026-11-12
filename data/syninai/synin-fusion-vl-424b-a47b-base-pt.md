# SyninAI/SYNIN-FUSION-VL-424B-A47B-Base-PT

## Resumen

SYNIN-FUSION-VL-424B-A47B-Base-PT es un modelo multimodal de tipo imagen-texto-a-texto publicado por SyninAI en Hugging Face. Por su nomenclatura, arquitectura declarada (`ernie4_5_moe_vl`) y contenido de la model card, se trata de una redistribución o adaptación del modelo base ERNIE-4.5-VL-424B-A47B-Base desarrollado por Baidu, con pesos en formato PyTorch estilo Transformer (sufijo `-PT` frente a los pesos nativos de PaddlePaddle). El modelo emplea una arquitectura Mixture-of-Experts (MoE) heterogénea con 424.000 millones de parámetros totales y 47.000 millones activos por token, y está entrenado de forma conjunta sobre modalidades textual y visual.

La relevancia del modelo radica en su escala y en el diseño MoE multimodal: separa expertos de texto y de visión (64 expertos de cada tipo, 8 activos por token) y utiliza enrutamiento aislado por modalidad para evitar que una modalidad interfiera en el aprendizaje de la otra. Con una ventana de contexto de 131.072 tokens, está orientado a tareas de comprensión de imagen, razonamiento entre modalidades y generación de texto de contexto largo.

Al ser una versión Base (solo preentrenamiento, sin ajuste fino supervisado ni alineación por preferencias), no está pensada para uso conversacional directo sin un post-entrenamiento adicional. El repositorio ocupa 847,2 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión), tipo `ernie4_5_moe_vl` |
| Parametros totales | 423.526.285.184 (≈424B) |
| Parametros activos | 47B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (la model card menciona cuantizacion 4-bit/2-bit sin perdida mediante "convolutional code quantization" para la familia ERNIE 4.5, pero no se detallan artefactos publicados para este repo) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PyTorch, `transformers`, con `custom_code`) |

Otros datos de configuracion declarados en la model card: 54 capas, 64 cabezas de atencion Q y 8 cabezas KV, 64 expertos de texto (8 activos) y 64 expertos de vision (8 activos), etapa de entrenamiento "Pretraining".

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE heterogenea multimodal. El tronco procesa texto y vision de forma conjunta, con expertos especializados por modalidad: 64 expertos de texto y 64 expertos de vision, de los cuales se activan 8 por token en cada caso. Para preservar el rendimiento de cada modalidad se incorporan enrutamiento aislado por modalidad (`modality-isolated routing`), una perdida de ortogonalidad de router (`router orthogonal loss`) y una perdida de equilibrio de tokens multimodal (`multimodal token-balanced loss`). La extraccion de caracteristicas visuales se realiza mediante un ViT, un adaptador de transformacion de caracteristicas y expertos visuales dedicados.

El entrenamiento se organizo en tres etapas: en las dos primeras solo se entrenan los parametros relacionados con texto, para consolidar la comprension linguistica y el procesamiento de texto largo; la tercera etapa incorpora la modalidad visual y el entrenamiento conjunto. Segun la model card, el preentrenamiento abarco billones de tokens. La infraestructura descrita incluye paralelismo hibrido heterogeneo, paralelismo de expertos intra-nodo, scheduling de pipeline eficiente en memoria y entrenamiento en precision mixta FP8. Para la familia ERNIE 4.5 se mencionan tambien metodos de post-entrenamiento (SFT, DPO y UPO), pero esta variante concreta es una version Base y no declara haber pasado por esas fases.

## Capacidades

- Comprension de imagen y texto combinados (pipeline `image-text-to-text`).
- Generacion de texto condicionada por imagen y por contexto textual largo.
- Razonamiento entre modalidades (cross-modal reasoning) segun la descripcion del preentrenamiento.
- Procesamiento de contexto largo: hasta 131.072 tokens.
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de inferencia con vLLM (>= 0.11.2) con `trust-remote-code`.
- No se declara soporte explicito de tool calling, function calling, modo thinking ni agentes multi-paso en la informacion disponible; al ser un modelo Base, estas capacidades requeririan post-entrenamiento.

## Casos de uso

- Fine-tuning multimodal supervisado: servir como punto de partida (Base) para SFT y DPO sobre dominios concretos, aprovechando los 424B de parametros y la separacion de expertos por modalidad para adaptar solo las rutas relevantes.
- Analisis de documentos con imagenes y texto largo: procesar informes, facturas o articulos cientificos que combinen figuras y tablas con texto extenso, apoyandose en la ventana de 131.072 tokens para mantener el documento completo en contexto.
- Investigacion en arquitecturas MoE multimodales: estudiar el efecto del enrutamiento aislado por modalidad y las perdidas de equilibrio de tokens comparando con variantes densas o MoE convencionales.
- Anotacion y descripcion de imagenes a escala: generar descripciones o etiquetas textuales de lotes de imagenes en pipelines de curaduria de datos, con cuantizacion 4-bit para reducir el coste de inferencia.
- Extraccion de informacion de capturas y diagramas: transformar diagramas tecnicos o capturas de pantalla en texto estructurado como paso previo a un sistema de recuperacion.
- Evaluacion comparativa de modelos base: usar el modelo como referencia de gran escala en estudios de escalado y de rendimiento de infraestructura (vLLM con paralelismo de tensor de 16 GPUs de 80 GB).
- Generacion de pares imagen-texto para entrenamiento: producir corpus sinteticos bilingues (en/zh) que alimenten modelos mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 847,2 GB en safetensors, lo que exige al menos ese orden de magnitud en memoria agregada para cargar los pesos en precision nativa (BF16/FP16). Con cuantizacion 4-bit el requisito se reduciria aproximadamente a la mitad, aunque no se detallan artefactos cuantizados publicados para este repositorio.
- Configuracion de referencia declarada: `vllm serve ... --tensor-parallel-size 16` sobre 16 GPUs de 80 GB (por ejemplo A100 80GB o H100 80GB), es decir, unos 1.280 GB de VRAM agregada.
- GPU consumer: no cabe en GPUs consumer (RTX 4090 de 24 GB, etc.) en su forma completa; requeriria cuantizacion agresiva y offloading, no documentado para este modelo.
- Despliegue: vLLM >= 0.11.2 con `--trust-remote-code`; la model card no documenta recetas para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SYNIN-FUSION-VL-424B-A47B-Base-PT | 424B / 47B | 131.072 | Texto + vision | Apache 2.0 | Hugging Face (repo de 847,2 GB) |
| ERNIE-4.5-VL-424B-A47B-Base (Baidu) | 424B / 47B | 131.072 | Texto + vision | Apache 2.0 | Hugging Face (pesos Paddle y PT) |
| ERNIE 4.5 serie A3B | No disponible en la informacion proporcionada | No disponible | Texto + vision (segun la model card) | Apache 2.0 | Hugging Face |
| Otras alternativas MoE multimodales de escala comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo Base: no ha pasado por SFT, DPO ni UPO, por lo que no debe usarse directamente como asistente conversacional sin post-entrenamiento.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion y de sesgos: inherente a un modelo preentrenado sobre corpus web de gran escala; no se documentan evaluaciones de sesgo ni de seguridad.
- Coste de despliegue: 847,2 GB de pesos y 16 GPUs de 80 GB como configuracion de referencia; inviable en infraestructura modesta.
- Requiere `trust-remote-code` en `transformers`/vLLM, lo que implica ejecutar codigo personalizado del repositorio.
- Repositorio sin descargas ni interacciones registradas y creado en noviembre de 2026; conviene verificar la procedencia e integridad de los pesos frente al original de Baidu.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan terminos adicionales ni limitaciones especificas del autor de la redistribucion.
- No se documentan artefactos cuantizados publicados para este repositorio concreto.

## Enlaces

- Hugging Face: https://huggingface.co/SyninAI/SYNIN-FUSION-VL-424B-A47B-Base-PT
- Organizacion Baidu en Hugging Face: https://huggingface.co/baidu
- Web oficial ERNIE: https://ernie.baidu.com/
- Blog ERNIE 4.5: https://ernie.baidu.com/blog/ernie4.5
- Repositorio GitHub ERNIE (PaddlePaddle): https://github.com/PaddlePaddle/ERNIE
- PaddlePaddle: https://github.com/PaddlePaddle/Paddle
- Discord: https://discord.gg/JPmZXDsEEK
- X (Twitter) PaddlePaddle: https://x.com/PaddlePaddle
