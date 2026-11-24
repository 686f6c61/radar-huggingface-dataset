# summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF

## Resumen

Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF es una cuantizacion GGUF en formato Q4_K_M del modelo summerMC/Qwen3.8-27B-Longbook27-VL-GDN64, un modelo de ~27.072 millones de parametros construido sobre una arquitectura Qwen3.8 (etiquetada internamente como `qwen35`) que incorpora componentes GDN/recurrentes. Lo publica el usuario summerMC en Hugging Face bajo licencia Apache-2.0, y su funcion es facilitar el despliegue del modelo original en entornos con recursos limitados mediante llama.cpp.

El modelo resuelve el problema de ejecutar un modelo de 27B en hardware de consumo o en servidores sin GPUs de gran capacidad: el repositorio ocupa 16,7 GB, lo que permite cargarlo en una unica GPU de 24 GB o incluso en configuraciones con offload parcial a CPU. Declara una longitud de contexto maxima de 262.144 tokens, lo que lo hace atractivo para tareas de contexto largo como analisis de documentos extensos o conversaciones multi-turno prolongadas.

Es relevante ahora porque combina tres tendencias: la familia Qwen como base abierta, las arquitecturas hibridas con componentes recurrentes (GDN) para reducir coste de atencion en contextos largos, y el ecosistema GGUF/llama.cpp como via estandar de despliegue local. No obstante, la model card advierte de que requiere una version reciente de llama.cpp y de que existe una bifurcacion especifica (`vnlpscale/llama.cpp`) para el soporte de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 / `qwen35` con componentes GDN/recurrentes (hibrida) |
| Parametros totales | 27.072.285.696 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun metadatos GGUF) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero SpeedX27-GDN64-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

La model card describe la arquitectura como Qwen3.8 / `qwen35`, con una modificacion respecto al transformer clasico: incorpora "componentes GDN/recurrentes" (el sufijo GDN64 del nombre apunta a ello). Esto sugiere un diseno hibrido en el que parte de las capas usan mecanismos recurrentes o de estado comprimido para abaratar el coste de la atencion en contextos muy largos, manteniendo el resto del stack en atencion estandar. El sufijo VL sugiere capacidades de vision-lenguaje, aunque la model card no lo confirma explicitamente ni detalla el encoder visual.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la mencion a los componentes GDN. La cuantizacion se realizo con `llama-quantize` a partir de un GGUF en BF16, segun el procedimiento descrito en la model card.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Procesamiento de contexto largo: hasta 262.144 tokens teoricos, con la posibilidad de configurar tamanos intermedios (8K, 32K, 64K) en funcion de la memoria disponible.
- Posible capacidad de vision-lenguaje por el sufijo VL del nombre, aunque no confirmada en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos extensos: con una ventana declarada de 262.144 tokens, el modelo puede ingerir contratos, informes anuales o expedientes completos en una sola pasada sin troceado, siempre que se configure `-c` con un valor acorde a la RAM/VRAM disponible.
- Asistentes conversacionales de contexto largo: la etiqueta `conversational` y la ventana amplia permiten mantener historiales de dialogo muy prolongados, util para soporte tecnico con trazabilidad de incidencias anteriores.
- Despliegue local en estaciones de trabajo: el fichero Q4_K_M de 16,7 GB cabe en GPUs de 24 GB (RTX 4090, A5000) con offload total de capas (`-ngl 99`), lo que permite prototipar sin infraestructura cloud.
- Servidor de inferencia ligero con llama-server: la model card documenta el arranque con `llama-server`, lo que facilita exponer una API compatible con OpenAI para integrarla en aplicaciones internas.
- Procesamiento por lotes en CPU/GPU mixta: al poder reducir `-ngl`, el modelo puede ejecutarse con offload parcial en maquinas sin GPU dedicada potente, adecuado para tareas offline de resumen o clasificacion.
- Evaluacion de arquitecturas hibridas: investigadores interesados en componentes GDN/recurrentes pueden usar esta cuantizacion para medir latencia y consumo de KV-cache frente a transformers clasicos del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 16,7 GB; a ello hay que sumar la KV-cache, cuyo tamano crece linealmente con el contexto configurado. Para 8K de contexto el consumo adicional es moderado; para 64K o mas puede requerir decenas de GB adicionales.
- GPU recomendadas: RTX 4090 (24 GB) o A5000 para carga completa en Q4_K_M con contextos moderados; A100 40/80 GB o H100 para contextos largos (64K-262K) sin offload.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con `-ngl 99` y contextos de 8K-32K; en GPUs de 16 GB requerira offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con build reciente; la model card menciona una bifurcacion especifica en `github.com/vnlpscale/llama.cpp` para el soporte de la arquitectura. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF (este) | ~27B | 262.144 | GGUF Q4_K_M | Apache-2.0 | Arquitectura hibrida con GDN; requiere llama.cpp reciente |
| Modelo base summerMC/Qwen3.8-27B-Longbook27-VL-GDN64 | ~27B | no disponible | safetensors/BF16 (presumible) | Apache-2.0 | Mayor precision, mayor huella de memoria |
| Alternativas de ~27B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La model card indica explicitamente "LLama.cpp unsported" (sic) y remite a una bifurcacion no oficial (`vnlpscale/llama.cpp`); el soporte en el llama.cpp upstream puede ser incompleto o inestable.
- Arquitectura no estandar: al incorporar componentes GDN/recurrentes, herramientas de inferencia, kernels y optimizaciones habituales pueden no funcionar o requerir builds especificos.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto al modelo en BF16; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se enumeran idiomas soportados; el rendimiento fuera del ingles y el chino es desconocido.
- El contexto maximo declarado (262.144 tokens) es teorico: en la practica esta limitado por la memoria disponible para la KV-cache y por la calidad del modelo en contextos extremos, no verificada.
- El repositorio tiene un volumen de adopcion bajo (349 descargas, 4 likes) y procede de un autor individual, no del equipo oficial de Qwen; conviene tratar el modelo como no auditado para produccion.
- Aunque la licencia es Apache-2.0, se recomienda revisar la licencia y notas del modelo base original antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF
- Modelo base: https://huggingface.co/summerMC/Qwen3.8-27B-Longbook27-VL-GDN64
- Bifurcacion de llama.cpp mencionada: https://github.com/vnlpscale/llama.cpp
