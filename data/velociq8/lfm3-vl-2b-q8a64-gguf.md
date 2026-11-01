# VelociQ8/LFM3-VL-2B-Q8A64-GGUF

## Resumen

LFM3-VL-2B es un modelo de vision-lenguaje desarrollado por Liquid AI, disenado para tareas visuales en dispositivo (on-device): responder preguntas sobre imagenes y video, leer documentos, graficos y pantallas de aplicaciones, localizar objetos y razonar sobre su posicion. El modelo original tiene 1.920 millones de parametros, repartidos en 1.730 millones para el modelo de lenguaje, 164 millones para el codificador visual y 25 millones para el proyector. Soporta una longitud de contexto de 128.000 tokens y razona antes de responder.

El repositorio que nos ocupa, `VelociQ8/LFM3-VL-2B-Q8A64-GGUF`, no es el modelo original sino una conversion del mismo al formato propietario Q8A64 de VelociQ8, un formato de pesos de 8 bits pensado para inferencia en CPU sobre arquitecturas Arm (aarch64) y x86-64. El conversor es el usuario VelociQ8 y el runtime necesario es VelociQ8 1.5 o superior, software propietario gratuito construido sobre llama.cpp. Esta conversion contiene unicamente el modelo de lenguaje; el proyector visual es el archivo original sin modificar.

La relevancia de esta ficha radica en que ilustra un caso de cuantizacion de 8 bits para CPU con un runtime no estandar: los archivos Q8A64 no cargan en llama.cpp estandar ni en Ollama convencional, y los fragmentos automaticos de "Use this model" de Hugging Face no funcionan. El modelo base esta publicado bajo la licencia LFM Open License v1.0, que restringe el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer) con codificador visual, proyector y modelo de lenguaje; razonamiento previo a la respuesta |
| Parametros totales | 1.792.225.888 (segun safetensors); 1.92B en el modelo original (1.73B LM + 164M vision + 25M proyector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo original) |
| Tipos de cuantizacion | Q8A64 (8 bits, formato propietario VelociQ8); el modelo original dispone de BF16 GGUF |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (LFM Open License v1.0); uso comercial solo por debajo de 10 M USD de ingresos anuales |
| Formato de pesos | GGUF en variante Q8A64 (carga exclusiva en runtime VelociQ8 1.5+) |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un modelo de vision-lenguaje compuesto por tres bloques: un codificador visual de 164 millones de parametros, un proyector de 25 millones que alinea las representaciones visuales con el espacio del lenguaje, y un modelo de lenguaje de 1.730 millones de parametros. La entrada es imagen y texto; la salida es texto, con un modo de razonamiento que genera una cadena de pensamiento antes de la respuesta final. El contexto declarado en el modelo original es de 128.000 tokens.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La conversion Q8A64 no modifica la arquitectura: es una cuantizacion de 8 bits de los pesos del modelo de lenguaje a partir del GGUF BF16 oficial, manteniendo el proyector original intacto. El runtime VelociQ8, construido sobre llama.cpp, incorpora kernels optimizados para Arm con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores) y para x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores), con seleccion automatica de kernels al arranque en la variante multi-Arquitectura.

## Capacidades

- Generacion de texto y razonamiento multimodal: responde preguntas sobre imagenes combinando entrada visual y textual.
- Comprension de documentos: lectura de documentos, graficos y pantallas de aplicaciones.
- Localizacion de objetos: deteccion y razonamiento sobre la posicion de elementos en una imagen.
- Razonamiento explicito: el modelo genera una cadena de razonamiento antes de la respuesta final.
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Entrada de imagen y texto con salida de texto (pipeline `image-text-to-text`).
- Procesamiento de video: la model card del autor menciona tareas sobre video, aunque esta conversion cubre la entrada de imagen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Lectura de documentos en dispositivo: el modelo puede procesar imagenes de documentos, facturas o formularios y extraer informacion estructurada, ejecutandose en CPU sin GPU gracias a la cuantizacion de 8 bits y al runtime VelociQ8.
- Accesibilidad visual: descripcion de imagenes y respuesta a preguntas sobre su contenido para usuarios con discapacidad visual, desplegado localmente en equipos Arm o x86-64 sin dependencia de la nube.
- Analisis de pantallas de aplicaciones: interpretacion de capturas de interfaz para automatizacion de pruebas o asistentes de soporte tecnico, aprovechando la capacidad de leer pantallas de aplicaciones declarada por el autor.
- Procesamiento de graficos y tablas: extraccion de tendencias y valores a partir de graficos en informes, con el razonamiento previo a la respuesta para justificar conclusiones.
- Localizacion de objetos en imagenes: identificacion y descripcion de la posicion de elementos en fotografias para inventario, logistica o analisis de imagenes industriales en entornos sin GPU.
- Asistente multilingue local: atencion a usuarios en cualquiera de los 16 idiomas soportados en despliegues edge (servidores Arm, equipos de escritorio) donde no se permite enviar datos a servicios externos.
- Analisis de video: la model card menciona tareas sobre video; en despliegues con el runtime VelociQ8 se podria emplear para resumir o responder preguntas sobre secuencias de video, aunque esta conversion solo cubre imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion "Speed and quality" con mediciones de velocidad y calidad, pero los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo esta cuantizado a 8 bits y el repositorio ocupa 2,4 GB. En GPU a traves de Vulkan (archivos Ollama para x86-64) el consumo seria del orden del tamano del archivo mas el proyector y el contexto.
- GPU recomendadas: no disponible. El runtime esta orientado a CPU; las compilaciones Ollama para x86-64 pueden usar GPU NVIDIA, AMD o Intel mediante Vulkan si el driver esta instalado.
- CPU compatibles: Arm de 64 bits con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores), cualquier Arm de 64 bits con la variante multi, y x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- Cabe en consumer GPU: no disponible; el enfasis del runtime es la inferencia en CPU.
- Opciones de despliegue: exclusivamente el runtime VelociQ8 1.5 o superior (basado en llama.cpp), con `llama-server`, `llama-cli`, `llama-embedding`, `llama-bench` y `llama-quantize`, API HTTP compatible con OpenAI. Tambien hay archivos Ollama 0.40.13 portables con VelociQ8 integrado y una imagen Docker `ghcr.io/dhaern/velociq8`. llama.cpp estandar, Ollama convencional y las herramientas GGUF habituales no pueden cargar archivos Q8A64.
- Requisitos del sistema: glibc 2.28 o superior en Linux; Windows 11 probado en x86-64.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B Q8A64 (este) | 1,92B | 128K | GGUF Q8A64 | LFM Open License v1.0 (comercial < 10 M USD) | Solo runtime VelociQ8; CPU Arm/x86-64 |
| LiquidAI/LFM3-VL-2B (original) | 1,92B | 128K | safetensors / BF16 GGUF | LFM Open License v1.0 | Modelo base; incluye proyector oficial |
| Otros modelos de vision-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Restriccion de licencia comercial: la LFM Open License v1.0 solo permite uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dolares (seccion 5). El runtime VelociQ8 es gratuito para uso comercial, pero eso no altera la licencia de los pesos.
- Compatibilidad limitada: los archivos Q8A64 solo cargan en VelociQ8 1.5 o superior. No funcionan en llama.cpp estandar, Ollama convencional ni en los fragmentos automaticos de Hugging Face.
- Cobertura parcial: esta conversion contiene solo el modelo de lenguaje; el proyector visual debe tomarse del repositorio original sin modificar.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad en la informacion disponible; como modelo de 2B, cabe esperar mayor propension a errores factuales que modelos de mayor tamano.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Limitaciones de idioma: aunque se declaran 16 idiomas, no se dispone de evaluaciones por idioma; el rendimiento en idiomas distintos del ingles puede ser inferior.
- Entrada de video: la model card menciona tareas sobre video, pero esta conversion cubre unicamente la entrada de imagen.
- Tool calling y agentes: no se documenta soporte en la informacion disponible.
- Madurez del ecosistema: el runtime es software propietario; la portabilidad y el soporte a largo plazo dependen del mantenedor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VelociQ8/LFM3-VL-2B-Q8A64-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentacion de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Perfil del autor: https://huggingface.co/VelociQ8
