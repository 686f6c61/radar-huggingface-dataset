# taobao-mnn/MNN-Pocket-0.3B-Base

## Resumen

MNN-Pocket-0.3B-Base es el checkpoint preentrenado (sin ajuste de instrucciones) de la familia MNN-Pocket-0.3B, un modelo de lenguaje compacto de aproximadamente 300 millones de parámetros desarrollado por el equipo taobao-mnn de Alibaba y codiseñado con la pila de inferencia MNN para despliegue en dispositivo. Su función es servir como punto de partida para preentrenamiento continuado y ajuste fino; para uso conversacional el autor remite al checkpoint con ajuste de instrucciones MNN-Pocket-0.3B.

Se trata de un transformer decoder-only de 28 capas, con tamaño oculto 896, atención GQA de 14 cabezas y 2 cabezas KV (head_dim 64), FFN intermedio de 2560 con activación SiLU, vocabulario de 65.536 tokens y embeddings de entrada y salida atados. El contexto declarado es de 32K, con 40.960 posiciones de embedding, y los pesos se distribuyen en bfloat16.

Su relevancia radica en la escala: con unos 361,5 millones de parámetros reales según safetensors, el autor reporta una media de 33,58 en una suite de 11 benchmarks de base, por delante de LFM2.5-350M-Base, SmolLM2-360M-Base y Gemma-3-270M-Base. El entrenamiento emplea una receta de datos multietapa con búsqueda conjunta sobre dominio, calidad, dificultad, densidad y estilo bajo un presupuesto fijo de tokens por parámetro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas |
| Parametros totales | 361.551.232 (reportado como ~300M por el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (40.960 posiciones de embedding) |
| Tipos de cuantizacion | bfloat16 en el checkpoint base; el autor publica builds INT4 MNN y GGUF en repositorios separados |
| Idiomas soportados | chino e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Otras especificaciones: tamaño oculto 896, 14 cabezas de atención con GQA de 2 cabezas KV, head_dim 64, FFN intermedio de 2560 con SiLU, vocabulario de 65.536 tokens, embeddings de entrada y salida atados, tamaño del repositorio de 0,7 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 28 capas con atención GQA (14 cabezas de consulta y 2 cabezas de clave-valor), lo que reduce el coste de memoria de la caché KV durante la inferencia, un aspecto crítico en despliegue móvil. El modelo usa embeddings atados entre entrada y salida, vocabulario de 65.536 tokens y FFN con activación SiLU. El contexto nominal es de 32K mediante 40.960 posiciones de embedding.

El entrenamiento se basa en una receta de datos multietapa con búsqueda conjunta sobre cinco ejes (dominio, calidad, dificultad, densidad y estilo) bajo un presupuesto fijo de tokens por parámetro. El autor no detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni confirma el uso de RLHF o DPO en este checkpoint base (el ajuste por instrucciones se publica por separado). La innovación principal declarada es el codiseño con la pila de inferencia MNN para ejecución en dispositivo.

## Capacidades

- Generación de texto: el checkpoint base realiza completado de texto plano, sin formato de chat ni plantilla conversacional.
- Razonamiento y conocimiento general: evaluado en una suite de 11 benchmarks de base, con media reportada de 33,58.
- Multilingüismo limitado a chino e inglés.
- Punto de partida para preentrenamiento continuado y ajuste fino supervisado.
- Compatible con herramientas estándar de Hugging Face (transformers, AutoModelForCausalLM, AutoTokenizer) sin adaptaciones.
- No incluye tool calling, function calling, capacidades de agente, visión ni audio en la información disponible.
- No dispone de modo de razonamiento explícito (thinking mode) en este checkpoint.

## Casos de uso

- Preentrenamiento continuado de dominio: al ser un base checkpoint, se puede continuar el preentrenamiento sobre corpus especializados (legal, médico, técnico) antes de un ajuste supervisado, aprovechando su contexto de 32K para documentos largos.
- Ajuste fino para clasificación y extracción: el checkpoint sirve como inicialización para tareas discriminativas mediante cabezas adicionales, con un coste de cómputo bajo gracias a sus 361 millones de parámetros.
- Generación de texto en dispositivos móviles: el codiseño con MNN y la existencia de builds INT4 permiten integrar el modelo en aplicaciones Android o iOS para autocompletado y sugerencias de texto sin conexión.
- Modelo base para investigación en eficiencia: su tamaño reducido y su receta de datos documentada lo hacen útil para estudiar el efecto de la mezcla de datos en modelos de ~300M.
- Filtrado y puntuación de texto: puede emplearse como modelo de lenguaje para calcular perplejidad y puntuar la calidad de corpus en pipelines de curación de datos.
- Prototipado rápido de asistentes: tras un ajuste de instrucciones ligero, sirve para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de texto bilingüe chino-inglés: adecuado para aplicaciones que requieran alternancia entre ambos idiomas en un entorno con recursos limitados.

## Benchmarks y rendimiento

El autor reporta una media de 33,58 en una suite de 11 benchmarks de base, por delante de LFM2.5-350M-Base, SmolLM2-360M-Base y Gemma-3-270M-Base. La tabla completa de resultados se remite al informe técnico (arXiv:2611.12311), que no está incluido en la información proporcionada.

| Benchmark | MNN-Pocket-0.3B-Base | LFM2.5-350M-Base | SmolLM2-360M-Base | Gemma-3-270M-Base |
|---|---|---|---|---|
| Media suite de 11 benchmarks | 33,58 | no disponible | no disponible | no disponible |
| Resultados por tarea | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 0,72 GB solo para pesos, más caché KV y activaciones; en la práctica, menos de 2 GB para inferencia con contexto moderado.
- VRAM estimada en INT4: alrededor de 0,2 GB para pesos, lo que permite ejecución en dispositivos móviles de gama media.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) ejecuta el modelo con holgura; también es viable en CPU y en aceleradores móviles mediante MNN.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM; también en Raspberry Pi y teléfonos de gama media con la build INT4.
- Opciones de despliegue: transformers (bfloat16), MNN (builds INT4 publicadas), llama.cpp/vLLM mediante el repositorio GGUF separado; Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media suite base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-Base | 361,5M | 32K | 33,58 | Apache 2.0 | Hugging Face (safetensors, GGUF, MNN) |
| LFM2.5-350M-Base | ~350M | no disponible | inferior a 33,58 según el autor | no disponible | no disponible |
| SmolLM2-360M-Base | ~360M | no disponible | inferior a 33,58 según el autor | no disponible | no disponible |
| Gemma-3-270M-Base | ~270M | no disponible | inferior a 33,58 según el autor | no disponible | no disponible |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no están incluidos en la información proporcionada; solo se conoce su posición relativa en la suite de benchmarks según la model card.

## Limitaciones y advertencias

- Es un checkpoint base sin ajuste de instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable; para chat debe usarse MNN-Pocket-0.3B.
- Riesgo de alucinación elevado por su escala: con ~300M de parámetros, la fidelidad factual es limitada y no debe usarse como fuente de verdad sin verificación.
- Cobertura lingüística restringida a chino e inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Contexto de 32K nominal, pero la calidad en ventanas largas no está verificada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- No se documentan capacidades de tool calling ni de agente; no deben asumirse.
- Los datos de benchmarks provienen del propio autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Modelo principal con ajuste de instrucciones: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket-0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Checkpoint SFT: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-SFT
- Build GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Build MNN INT4: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Modelo de decisión no autorregresivo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe técnico: https://arxiv.org/pdf/2611.12311
- Model card en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base/blob/main/README-cn.md
