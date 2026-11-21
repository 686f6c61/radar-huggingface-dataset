# Teriks/Kandinsky-5.0-T2V-Lite-sft-5s-quants

## Resumen

Teriks/Kandinsky-5.0-T2V-Lite-sft-5s-quants es un conjunto de cuantizaciones del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Lite, desarrollado originalmente por el equipo de Kandinsky Lab (kandinskylab). El repositorio no contiene un modelo nuevo, sino los pesos del transformer del modelo base kandinskylab/Kandinsky-5.0-T2V-Lite-sft-5s-Diffusers convertidos a multiples formatos de cuantizacion para reducir el coste de memoria en inferencia.

El autor, Teriks, ha generado estas versiones con su herramienta dgenerate 6.0.0, ofreciendo 12 variantes GGUF (desde Q2_K hasta IQ4_XS y Q8_0) y dos variantes en safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise). El modelo base es un transformer de difusion 3D de aproximadamente 2.000 millones de parametros, orientado a la generacion de clips de video de 5 segundos a partir de una descripcion textual.

La relevancia de este repositorio es practica: permite ejecutar un modelo de video generativo en hardware con recursos limitados, algo inviable con los pesos en precision completa. Al estar disponible en GGUF y en formatos nativos de ComfyUI, se integra en flujos de trabajo de generacion local sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (Kandinsky5Transformer3DModel) |
| Parametros totales | 2.007.702.848 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible (modelo texto-a-video; el idioma depende del codificador de texto del pipeline base) |
| Licencia | no disponible (se aplica la licencia del modelo base kandinskylab/Kandinsky-5.0-T2V-Lite-sft-5s-Diffusers) |
| Formato de pesos | GGUF y safetensors (variantes ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion tridimensional (Kandinsky5Transformer3DModel) integrado en el pipeline Kandinsky5T2VPipeline. La generacion de video se realiza mediante difusion sobre latentes espacio-temporales, partiendo de una condicion textual codificada por el codificador de texto del pipeline. El modelo base corresponde a la variante Lite con entrenamiento SFT y ventana de generacion de 5 segundos.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO o etapas de fine-tuning) no se dispone de informacion en los datos proporcionados. Este repositorio unicamente documenta el proceso de cuantizacion: los pesos del componente transformer se convierten con dgenerate 6.0.0 a 12 formatos GGUF y a dos formatos safetensors para ComfyUI, manteniendo los nombres de tensor originales en los ficheros sin sufijo, y usando nombres de tensor de ComfyUI o de llama.cpp en los ficheros con sufijo `-comfy` y `-llama` respectivamente.

## Capacidades

- Generacion de video texto-a-video: produce clips de 5 segundos a partir de una descripcion textual, usando el pipeline Kandinsky5T2VPipeline.
- Difusion latente 3D: modela de forma conjunta las dimensiones espacial y temporal del video.
- Ejecucion cuantizada: los pesos GGUF permiten inferencia con menor huella de memoria (desde 638,8 MB en Q2_K hasta 2,0 GB en Q8_0).
- Compatibilidad con ComfyUI: las variantes float8_e4m3fn e int8_tensorwise usan nombres de tensor de ComfyUI y se integran en grafos de nodos de dicha herramienta.
- Compatibilidad con dgenerate: los ficheros GGUF estan pensados para usarse con la herramienta dgenerate.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion local de clips de video en equipos de consumo: usando el GGUF Q4_K (1,1 GB) o Q5_K (1,3 GB) se puede ejecutar el transformer en GPUs con 8-12 GB de VRAM, algo imposible con los pesos en precision completa.
- Prototipado rapido de video generativo en ComfyUI: las variantes float8_e4m3fn e int8_tensorwise (1,9 GB) se cargan directamente como componentes del pipeline en grafos de ComfyUI, permitiendo iterar sobre prompts sin salir del entorno de nodos.
- Pruebas de concepto en portatiles con GPU: el formato Q2_K (638,8 MB) permite ejecutar el transformer en GPUs de portatil con 6-8 GB de VRAM, adecuado para demos y validacion de ideas.
- Integracion en pipelines de dgenerate: los ficheros GGUF se usan con dgenerate 6.0.0 pasando el repositorio base como modelo y el fichero de cuantizacion como opcion del componente, lo que facilita automatizar generacion por lotes.
- Evaluacion comparativa de calidad frente a tamano: al disponer de 12 niveles de cuantizacion, se puede medir la degradacion visual del video generado entre Q2_K y Q8_0 para elegir el punto de equilibrio en un despliegue concreto.
- Despliegue en servidores con VRAM limitada: la variante Q8_0 (2,0 GB) ofrece la mayor fidelidad de los GGUF con una huella reducida, util para servir peticiones de generacion de video en GPUs como RTX 3060 o superiores.
- Investigacion sobre cuantizacion en modelos de difusion de video: el repositorio sirve como material para estudiar como afectan distintos esquemas (K-quants, I-quants, int8) a la calidad de un transformer de difusion 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun cuantizacion: Q2_K ~0,64 GB; Q3_K ~0,83 GB; Q4_0/Q4_K/IQ4_NL ~1,1 GB; Q4_1 ~1,2 GB; Q5_0/Q5_K ~1,3 GB; Q5_1 ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~2,0 GB; float8_e4m3fn e int8_tensorwise ~1,9 GB. A esta cifra hay que sumar la memoria del codificador de texto, del VAE y de los latentes del pipeline completo.
- GPUs recomendadas: no disponible en la informacion proporcionada. Por el tamano del transformer cuantizado, es plausible su ejecucion en GPUs de consumo, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Cabida en GPU de consumo: el transformer cuantizado cabe en GPUs de consumo por tamano; no se dispone de confirmacion oficial del pipeline completo ni de requisitos de VRAM totales.
- Opciones de despliegue: dgenerate 6.0.0 (GGUF), ComfyUI (safetensors float8_e4m3fn e int8_tensorwise). No se mencionan vLLM, llama.cpp, Ollama ni TGI; llama.cpp solo aparece como convencion de nombres de tensor en los ficheros `-llama`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / duracion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Lite-sft-5s-quants | 2.007.702.848 | clips de 5 s | GGUF (12 variantes) y safetensors ComfyUI (2 variantes) | la del modelo base (no disponible) | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2V-Lite-sft-5s-Diffusers | 2.007.702.848 (pesos originales) | clips de 5 s | safetensors en precision original | no disponible | Hugging Face |
| Otros modelos texto-a-video de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que en la informacion proporcionada no se identifican alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: contiene solo los pesos cuantizados del componente transformer. Es necesario usar el repositorio base kandinskylab/Kandinsky-5.0-T2V-Lite-sft-5s-Diffusers para obtener la configuracion, el codificador de texto y el VAE.
- La licencia no esta declarada en la model card; se indica que se aplica la licencia del modelo base, que no se detalla. Antes de un uso comercial hay que verificar la licencia del modelo original.
- Las cuantizaciones agresivas (Q2_K, Q3_K) pueden degradar la calidad del video generado; no se aportan metricas de calidad por nivel de cuantizacion.
- Riesgo de alucinacion y sesgos: no hay informacion especifica; al ser un modelo de difusion condicionado por texto, hereda los sesgos del dataset de entrenamiento del modelo base, no documentados aqui.
- Limitaciones de contexto e idioma: no disponibles.
- Los ficheros con sufijo `-comfy` usan nombres de tensor de ComfyUI y los `-llama` de llama.cpp; mezclar convenciones de nombres al cargar los pesos puede provocar errores.
- El repositorio incluye ficheros de ejecuciones de cuantizacion anteriores, por lo que conviene seleccionar cuidadosamente el fichero concreto que se va a cargar.
- No se proporcionan datos de latencia, throughput ni requisitos totales de VRAM del pipeline completo, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Lite-sft-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-sft-5s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
