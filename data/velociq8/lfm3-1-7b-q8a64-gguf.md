# VelociQ8/LFM3-1.7B-Q8A64-GGUF

## Resumen

LFM3-1.7B-Q8A64-GGUF es la conversión al formato Q8A64 de VelociQ8 del modelo LFM3-1.7B desarrollado por Liquid AI. Se trata de un modelo de lenguaje de 1.792.225.888 parámetros (aproximadamente 1,73B según la model card) orientado a generación de texto conversacional, razonamiento y tool calling, diseñado para ejecutarse íntegramente en CPU tanto en arquitecturas Arm (aarch64) como x86-64. El modelo base emplea la arquitectura "Liquid" de Liquid AI y soporta una ventana de contexto de 256K tokens en su versión original.

La relevancia de esta ficha reside en que no se distribuye como un GGUF estándar: Q8A64 es un formato propietario de pesos de 8 bits que solo puede cargarse con el runtime VelociQ8 (versión 1.5 o superior para este modelo concreto). Esto implica que las herramientas habituales del ecosistema GGUF, incluido llama.cpp estándar, Ollama convencional o los snippets automáticos de Hugging Face, no funcionan con estos ficheros. El repositorio ocupa 2,0 GB e incluye, además de los pesos, los binarios del runtime para Linux y Windows en Arm y x86-64, además de una imagen Docker.

El modelo cubre 16 idiomas (entre ellos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco) y está pensado para agentes locales, salidas estructuradas y ajuste fino sobre dominios propios. Su licencia LFM Open License v1.0 restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid (LFM3), transformer con innovaciones propias de Liquid AI; detalles completos no disponibles |
| Parametros totales | 1.792.225.888 (1,73B según model card) |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | 256K tokens (modelo original) |
| Tipos de cuantizacion | Q8A64 (8 bits, formato propietario VelociQ8); el repo base ofrece BF16 GGUF oficial |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (uso comercial solo por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | Q8A64 (solo cargable con runtime VelociQ8 1.5+) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura denominada "Liquid" por Liquid AI, si bien la información disponible no detalla la composición interna exacta (número de capas, tipo de atención, uso de capas recurrentes o híbridas). La model card del repositorio cuantizado no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o similares. Lo que sí se explicita es que el modelo "razona antes de responder", lo que sugiere un modo de razonamiento previo a la generación de la respuesta final, y que está optimizado para tool calling y salidas estructuradas.

La contribución técnica de este repositorio no está en el entrenamiento sino en la cuantización: el GGUF BF16 oficial de Liquid AI se convierte al formato Q8A64 de VelociQ8, que almacena los pesos en 8 bits y utiliza kernels optimizados para CPU con soporte de dotprod en Arm (Ampere Altra, AWS Graviton2+, Neoverse N1+) y AVX2/FMA en x86-64 (Intel Haswell, AMD Zen y posteriores). El runtime VelociQ8, construido sobre llama.cpp, expone las mismas herramientas (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`) y una API HTTP compatible con OpenAI. En x86-64 es posible además acelerar mediante GPU a través de Vulkan en las distribuciones portables de Ollama.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 256K tokens en el modelo original.
- Razonamiento explícito antes de responder (modo de pensamiento previo a la respuesta).
- Tool calling y function calling, orientado a agentes locales.
- Salidas estructuradas (structured outputs), útil para integración con pipelines que requieren JSON u otros formatos fijos.
- Capacidades multilingües en 16 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ajuste fino sobre dominios propios (fine-tuning), según indica la model card del modelo base.
- Inferencia en CPU en Arm y x86-64, con soporte opcional de GPU vía Vulkan en los paquetes Ollama para x86-64.
- No se documentan capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Agentes locales de escritorio o servidor: el modelo puede ejecutarse íntegramente en CPU en máquinas Arm (Graviton, Ampere Altra) o x86-64 sin GPU, lo que permite desplegar agentes con tool calling en entornos sin acelerador hardware, usando `llama-server` con API compatible OpenAI.
- Automatización de atención al cliente multi-turno: gracias a la ventana de 256K tokens del modelo original, puede mantener conversaciones largas con historial extenso y contexto documental, aunque en la práctica el rendimiento en CPU condicionará la longitud viable.
- Extracción de datos estructurados: las capacidades de salida estructurada permiten convertir texto libre en JSON validado para pipelines ETL o integración con bases de datos, ejecutándose en el mismo servidor de aplicaciones sin GPU dedicada.
- Asistentes de código y razonamiento paso a paso: el modo de razonamiento previo a la respuesta y el soporte de tool calling lo hacen adecuado para tareas de depuración guiada o generación de scripts con verificación intermedia, integrándolo en un IDE o CLI mediante la API HTTP.
- Procesamiento por lotes en clústeres Arm: en entornos como AWS Graviton o Ampere Altra, el formato Q8A64 con kernels dotprod permite clasificación, resumen o etiquetado de grandes volúmenes de documentos sin coste de GPU.
- Despliegue en Windows corporativo: el paquete `velociq8-1.5-windows-x64.zip` y la variante Ollama portátil permiten ejecutar el modelo en estaciones Windows 11 con CPU x86-64, útil para prototipos internos o herramientas ofimáticas asistidas.
- Ajuste fino sobre dominio propio: al derivar del modelo base LFM3-1.7B, es posible partir de los pesos originales (no del Q8A64) para fine-tuning y después cuantizar a Q8A64 para despliegue en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección "Speed and quality" con mediciones, pero no se incluyen los valores numéricos en los datos proporcionados, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni comparativas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el fichero Q8A64 ocupa aproximadamente 2,0 GB (tamaño total del repositorio, que incluye runtime). El modelo en 8 bits requiere del orden de 1,8-2 GB de memoria RAM para los pesos, más overhead de contexto.
- GPU recomendadas: no son necesarias; el runtime está diseñado para CPU. En x86-64, las distribuciones Ollama portátiles pueden usar GPU NVIDIA, AMD o Intel vía Vulkan si el driver está instalado.
- CPU compatibles: Arm con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores); cualquier Arm de 64 bits con el paquete `multi`; x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- Requisitos de sistema: glibc 2.28 o superior en Linux; Windows 11 probado para el paquete x86-64.
- Opciones de despliegue: runtime VelociQ8 1.5+ (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`), Ollama portátil 0.40.13 incluido en los archivos del repo, imagen Docker `ghcr.io/dhaern/velociq8`. No es compatible con llama.cpp estándar, Ollama convencional ni los snippets automáticos de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Q8A64-GGUF (este) | 1,73B | 256K | Q8A64, solo VelociQ8 1.5+ | LFM Open License v1.0 (comercial < 10 M USD) | Optimizado para CPU Arm/x86; runtime propietario |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | safetensors / BF16 GGUF oficial | LFM Open License v1.0 | Pesos originales; permite fine-tuning y uso con llama.cpp estándar vía GGUF BF16 |
| Alternativas de ~1-2B en GGUF estándar | no disponible | no disponible | GGUF estándar (llama.cpp, Ollama) | variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables concretos en la información proporcionada más allá del propio modelo base.

## Limitaciones y advertencias

- El formato Q8A64 es propietario: no se puede cargar con llama.cpp estándar, Ollama convencional ni los snippets de "Use this model" de Hugging Face. Requiere VelociQ8 1.5 o superior para este modelo.
- El runtime VelociQ8 es software propietario de uso gratuito; su gratuidad no altera la licencia de los pesos.
- Licencia LFM Open License v1.0: el uso comercial solo está permitido por debajo de 10 millones de dólares de ingresos anuales (sección 5). Organizaciones por encima de ese umbral necesitan licencia adicional de Liquid AI.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible verificar el rendimiento real frente a alternativas.
- La información sobre arquitectura interna, datos de entrenamiento y fases de alineación (RLHF/DPO) no está disponible en la documentación proporcionada.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros; no se documentan evaluaciones específicas de fidelidad.
- El contexto efectivo en CPU puede verse limitado por la memoria disponible y el coste computacional de atender 256K tokens; la ventana máxima no garantiza rendimiento práctico a esa longitud.
- El modelo no incluye capacidades de visión ni audio según la información disponible.
- Posibles sesgos derivados del corpus de entrenamiento no documentado; no se detallan evaluaciones de sesgo.
- El repositorio tiene 73 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VelociQ8/LFM3-1.7B-Q8A64-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Perfil del autor: https://huggingface.co/VelociQ8
