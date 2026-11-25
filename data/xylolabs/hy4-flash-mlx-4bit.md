# Xylolabs/Hy4-flash-MLX-4bit

## Resumen

Hy4-flash-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo multimodal tencent/Hy4-flash, desarrollada por Xylolabs para su ejecución en Apple Silicon. El modelo base es un Mixture of Experts (MoE) de 220.000 millones de parámetros totales con 12.000 millones activos por token, capaz de procesar entradas de imagen y texto y generar respuestas conversacionales. Esta versión reduce el peso de los pesos a 97,545 GB en formato MLX 4-bit, lo que permite desplegarlo en hardware de Apple con memoria unificada alta, como Mac Studio M5 Max o M5 Ultra.

La relevancia de esta ficha radica en que traslada un modelo de escala de servidor al ecosistema local de Apple, manteniendo una fidelidad razonable respecto a la referencia BF16: la model card reporta una divergencia KL de 0,256439 en WikiText-2 con un 83,608% de acuerdo top-1, y un 86,922% de acuerdo top-1 en texto reservado (held-out). El modelo está pensado para inferencia local con la librería mlx-lm 0.32.2 y admite modos de esfuerzo de razonamiento (`no_think`, `high`, `max`), además de usar un drafter DFly2 para decodificación especulativa por defecto.

El modelo solo declara soporte para inglés y chino, y su licencia es la Tencent Hy License 1.0, lo que condiciona el uso comercial. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; los únicos datos de calidad son las métricas de fidelidad de cuantización frente a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal image-text-to-text; pesos convertidos a MLX |
| Parametros totales | 155.578.270.229 (según safetensors); la model card declara 220B totales |
| Parametros activos | 12B (según model card) |
| Longitud de contexto | Hasta 1M tokens en Mac Studio M5 Ultra con 256 GB; 512K en M5 Max de 128 GB (con límite de memoria GPU elevado) |
| Tipos de cuantizacion | MLX 4-bit (único publicado en este repo) |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | safetensors (MLX), repo de 163,5 GB; archivo 4-bit de 97,545 GB |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un transformer con arquitectura Mixture of Experts y capacidad multimodal de entrada imagen-texto. Esta versión de Xylolabs no reentrena el modelo: cuantiza los pesos a 4 bits y los convierte al formato MLX para su ejecución en Apple Silicon mediante mlx-lm 0.32.2. La model card menciona que los archivos "Engram" se leen de forma aleatoria durante la generación, por lo que recomienda mantener la carpeta en un SSD local; no se detalla en la información disponible qué papel desempeñan esos archivos en la arquitectura.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión incluye un drafter DFly2 en el directorio `hy4_mlx/` que adapta código Apache-2.0 (ver `hy4_mlx/LICENSE.transformers`) y se usa por defecto en el comando de chat, lo que sugiere decodificación especulativa para acelerar la generación. El modelo expone tres niveles de esfuerzo de razonamiento: `no_think`, `high` y `max`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), con respuestas basadas en imágenes.
- Razonamiento con niveles de esfuerzo configurables (`no_think`, `high`, `max`).
- Decodificación especulativa mediante el drafter DFly2 incluido.
- Ejecución local en Apple Silicon con mlx-lm.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.
- No se documentan capacidades de audio ni de visión más allá de la entrada de imagen.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con contexto de hasta 512K–1M tokens en equipos M5 Max/M5 Ultra, adecuado para usuarios que necesitan privacidad sin enviar datos a la nube.
- Análisis de documentos extensos con imágenes: gracias a la ventana de contexto larga y a la entrada multimodal, se puede cargar un informe con figuras y hacer preguntas sobre su contenido en una sola sesión.
- Prototipado de aplicaciones multimodales en Apple Silicon: desarrolladores que quieran validar flujos image-text-to-text antes de desplegar en servidores pueden usar esta versión 4-bit en un Mac Studio.
- Investigación sobre cuantización: las métricas de fidelidad frente a BF16 (KL y top-1 en WikiText-2, chat y held-out) permiten estudiar el impacto de la cuantización 4-bit en un MoE de gran escala.
- Generación de descripciones y respuestas sobre capturas o diagramas en entornos de oficina con hardware Apple, sin depender de APIs externas.
- Evaluación de decodificación especulativa: el drafter DFly2 integrado sirve para medir latencia y throughput en inferencia local con mlx-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de la cuantización 4-bit frente a la referencia BF16:

| Metrica | Valor |
|---|---|
| Tamano del archivo 4-bit | 97,545 GB |
| WikiText-2 KL | 0,256439 |
| WikiText-2 top-1 | 83,608% |
| Chat KL | 0,397236 |
| Chat top-1 | 83,821% |
| Held-out KL | 0,184808 |
| Held-out top-1 | 86,922% |
| Verificación de respuestas | 5/5 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el archivo 4-bit ocupa 97,545 GB; hay que sumar la caché KV en f16 para el contexto deseado y 2 GB para el runtime. La model card indica que el archivo cabe cuando su tamaño más la caché KV más 2 GB queda por debajo del 75% de la memoria (límite por defecto de GPU en macOS).
- Mac Studio M5 Max de 32 GB, 40 GB y 64 GB: no cabe ningún archivo según la tabla del autor.
- Mac Studio M5 Ultra de 96 GB: no cabe.
- Mac Studio M5 Max de 128 GB: cabe el archivo 4-bit con contexto de 512K, solo elevando el límite de memoria GPU de macOS (hasta el 90%).
- Mac Studio M5 Ultra de 256 GB: cabe con contexto de 1M.
- Mac Studio M5 Ultra de 512 GB (GPU de 80 núcleos): cabe con contexto de 1M.
- GPU NVIDIA (A100, H100, RTX 4090): no aplica; esta conversión es específica para MLX en Apple Silicon.
- Despliegue: mlx-lm 0.32.2 con el módulo `hy4_mlx.chat`; requiere almacenamiento en SSD local por la lectura aleatoria de los archivos Engram.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, el modelo base tencent/Hy4-flash (220B totales, 12B activos, multimodal, licencia Tencent Hy) es la alternativa directa en BF16 para servidores; esta versión MLX 4-bit es la opción para Apple Silicon. No se han identificado en la información disponible otras conversiones MLX 4-bit del mismo modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-4bit | 220B totales / 12B activos (según model card) | 512K–1M según hardware | MLX 4-bit | Tencent Hy License 1.0 | Hugging Face (Xylolabs) |
| tencent/Hy4-flash | 220B totales / 12B activos | no disponible | BF16 | Tencent Hy License 1.0 | Hugging Face (Tencent) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de veracidad.
- La cuantización 4-bit introduce divergencia respecto a BF16 (KL de 0,256439 en WikiText-2 y 0,397236 en chat), lo que puede degradar respuestas en tareas sensibles.
- Licencia Tencent Hy License 1.0: es necesario revisar el archivo LICENSE antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- Requiere hardware Apple Silicon de gama alta (M5 Max de 128 GB o M5 Ultra); no es desplegable en GPU NVIDIA con este formato.
- La lectura aleatoria de los archivos Engram exige SSD local; ejecutarlo desde almacenamiento en red o lento puede degradar el rendimiento.
- En M5 Max de 128 GB solo cabe elevando el límite de memoria GPU de macOS al 90%, lo que reduce el margen para el sistema operativo.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.
- No hay información sobre sesgos específicos del modelo base ni sobre su composición de datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy4-flash-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/Xylolabs/Hy4-flash-MLX-4bit/blob/main/LICENSE
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de código de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de MLX: https://github.com/ml-explore/mlx
