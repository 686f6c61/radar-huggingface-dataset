# VelociQ8/LFM3-1.7B-Base-Q8A64-GGUF

## Resumen

LFM3-1.7B-Base-Q8A64-GGUF es una cuantización a 8 bits (formato Q8A64) del modelo base LFM3-1.7B-Base de Liquid AI, publicada por el usuario VelociQ8 en Hugging Face. El modelo original es un modelo preentrenado de 1.73B parámetros que solo continúa texto: no tiene ajuste para chat ni instrucciones. Liquid AI lo recomienda como punto de partida para fine-tuning intensivo; para chat, tool calling o agentes remite al modelo afinado LFM3-1.7B.

La relevancia de esta ficha está en el formato: Q8A64 es un formato de pesos de 8 bits propio del runtime VelociQ8, construido sobre llama.cpp, orientado a inferencia rápida en CPU tanto en arquitecturas Arm (aarch64) como x86-64. El repositorio original de Liquid AI no publica GGUF, por lo que este archivo se ha convertido desde los safetensors (primero a BF16 GGUF con llama.cpp b11963 y después a Q8A64).

El modelo base soporta una ventana de contexto de 256K tokens y 16 idiomas (entre ellos castellano). La licencia de pesos es la LFM Open License v1.0, que permite uso comercial solo a empresas con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM de Liquid AI; detalles de la arquitectura no especificados en la model card) |
| Parametros totales | 1.792.225.472 (dato real de safetensors; la model card indica 1.73B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 256K tokens en el modelo original |
| Tipos de cuantizacion | Q8A64 (8 bits, formato propio de VelociQ8); conversión intermedia a BF16 GGUF |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, "other"); uso comercial solo con ingresos anuales < 10 M USD |
| Formato de pesos | GGUF (Q8A64); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, y la etiqueta "liquid" en los metadatos lo confirma como miembro de esa familia. No se especifica si es un transformer denso, un híbrido u otra arquitectura; el runtime VelociQ8 indica soporte para "embeddings, dense and MoE LLMs", sin concretar el caso de este modelo. Tampoco se publican datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre fases de RLHF o DPO, coherente con que se trate de un modelo base sin ajuste de preferencias.

En cuanto al pipeline de conversión: el repositorio original de Liquid AI no incluye GGUF, por lo que VelociQ8 convirtió los safetensors a BF16 GGUF con llama.cpp b11963 y posteriormente al formato Q8A64 de 8 bits. Este formato solo es cargable por el runtime VelociQ8 1.1 o posterior (y para este modelo concreto se requiere VelociQ8 1.5 o superior); el llama.cpp estándar, Ollama oficial y otras herramientas GGUF no pueden cargarlo.

## Capacidades

- Continuación de texto: es un modelo base preentrenado que completa el texto que se le proporciona; no sigue instrucciones ni mantiene conversaciones de forma fiable.
- Soporte multilingüe: 16 idiomas, incluidos castellano (es), inglés, chino, japonés, coreano, árabe, hindi, ruso, portugués, francés, alemán, italiano, vietnamita, tailandés, indonesio y polaco.
- Contexto largo: hasta 256K tokens en el modelo original, útil para completar documentos extensos.
- Punto de partida para fine-tuning: Liquid AI lo recomienda explícitamente como base para ajuste intensivo (SFT, DPO, etc.).
- No dispone de: chat tuning, tool calling, capacidades de agente, visión ni audio (no se mencionan y es un modelo base de texto).

## Casos de uso

- Fine-tuning para dominios específicos: al ser el modelo base detrás de LFM3-1.7B, es adecuado para entrenar un modelo especializado (legal, médico, técnico) partiendo de unos 1.7B parámetros, con un coste de entrenamiento bajo.
- Inferencia en CPU en servidores Arm: el formato Q8A64 y el runtime VelociQ8 están optimizados para CPUs Arm con dotprod (Ampere Altra, AWS Graviton2, Neoverse N1), útil para despliegues en la nube Arm sin GPU.
- Completado de texto estilo autocompletado: puede integrarse como motor de continuación de texto en editores o herramientas de escritura, donde no se requiere comportamiento de chat.
- Investigación y experimentación: útil para estudiar el comportamiento de modelos base de la familia LFM, medir perplejidad o evaluar técnicas de decodificación antes del ajuste fino.
- Despliegue local sin GPU: con unos 2 GB de tamaño de repositorio, puede ejecutarse en portátiles y máquinas x86-64 con AVX2/FMA (Intel Haswell, AMD Zen y posteriores) mediante VelociQ8 u Ollama portable.
- Base para modelos de instrucciones propios: un equipo puede aplicar SFT sobre este modelo para crear su propio asistente ligero con control total sobre los datos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección "Speed and quality" con mediciones de velocidad y calidad, pero su contenido no está incluido en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria: el archivo Q8A64 ocupa unos 2 GB; al ejecutarse en CPU, el requisito es de RAM (del orden de 2-3 GB para el modelo más el contexto), no de VRAM. Con GPU vía Vulkan en los archivos Ollama x86-64, bastaría una GPU con ~2-3 GB de memoria.
- CPU recomendadas: Arm con instrucciones dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores) o x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores). Existe un binario "multi" para cualquier Arm de 64 bits que selecciona los kernels óptimos al arrancar.
- Consumer: cabe sin problemas en cualquier PC moderno sin GPU dedicada; los archivos Ollama portables de x86-64 pueden usar GPU NVIDIA, AMD o Intel a través de Vulkan si el driver está instalado.
- Despliegue: exclusivamente mediante VelociQ8 1.5 o superior (herramientas llama-server, llama-cli, llama-embedding, llama-bench, llama-quantize con API HTTP compatible con OpenAI). También hay archivos Ollama portable 0.40.13 con VelociQ8 integrado, imagen Docker (ghcr.io/dhaern/velociq8) y soporte de Windows 11 en x64. Importante: llama.cpp estándar, Ollama oficial y los snippets automáticos de Hugging Face no funcionan con estos archivos. Los binarios Linux requieren glibc 2.28 o superior.
- Latencia y throughput: no disponible (la model card remite a mediciones de velocidad no incluidas en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-Q8A64 (esta ficha) | 1.79B | 256K | GGUF Q8A64 (solo VelociQ8) | LFM Open License v1.0 (< 10 M USD ingresos) | Modelo base, sin chat |
| LFM3-1.7B (Liquid AI) | 1.73B | 256K | safetensors | LFM Open License v1.0 | Versión afinada para chat, tool calling y agentes |
| Qwen2.5-1.5B (Alibaba) | 1.5B | 128K | safetensors, GGUF comunitarios | Apache 2.0 (base) | Alternativa abierta con ecosistema GGUF estándar |

La comparación con Qwen2.5-1.5B es orientativa: es un modelo de tamaño similar con licencia más permisiva y compatibilidad con herramientas GGUF estándar, aunque los datos de rendimiento entre ambos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: solo continúa texto; usarlo directamente como asistente producirá resultados pobres. Para chat, tool calling o agentes, usar LFM3-1.7B afinado.
- Restricción de licencia: la LFM Open License v1.0 limita el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares (sección 5). El runtime VelociQ8 es gratuito para uso comercial, pero eso no modifica la licencia de los pesos.
- Compatibilidad cerrada: los archivos Q8A64 solo cargan en VelociQ8 1.1+ (este modelo requiere 1.5+); son incompatibles con llama.cpp estándar, Ollama oficial y las herramientas GGUF habituales.
- Sesgos: no disponible; al ser un modelo base multilingüe preentrenado, cabe esperar sesgos típicos de datos web sin mitigaciones de alineación.
- Alucinaciones: como modelo base sin ajuste por instrucciones ni RLHF, el riesgo de generar texto sin fundamento es alto; no debe usarse para tareas factuales sin ajuste o verificación posterior.
- Contexto: los 256K tokens corresponden al modelo original; no está confirmado en la información proporcionada que la conversión Q8A64 preserve el contexto completo en el runtime.
- Datos de la conversión: la conversión a BF16 GGUF y luego a Q8A64 fue realizada por un tercero (VelociQ8), no por Liquid AI; conviene validar la calidad de la cuantización antes de uso en producción.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/VelociQ8/LFM3-1.7B-Base-Q8A64-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo afinado recomendado para chat: https://huggingface.co/VelociQ8/LFM3-1.7B-Q8A64-GGUF
- Licencia de pesos: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Todos los modelos de VelociQ8: https://huggingface.co/VelociQ8
- Carpeta runtime del repositorio: https://huggingface.co/VelociQ8/LFM3-1.7B-Base-Q8A64-GGUF/tree/main/runtime
