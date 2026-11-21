# Teriks/Kandinsky-6.0-Lite-distill-5s-quants

## Resumen

Teriks/Kandinsky-6.0-Lite-distill-5s-quants es un conjunto de cuantizaciones en formato GGUF del transformer del modelo de generacion de video kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers. Lo publica el desarrollador Teriks (autor de la herramienta dgenerate) y no es un modelo nuevo, sino una redistribucion optimizada para inferencia con menor huella de memoria del componente `transformer` del pipeline `Kandinsky6TI2VAPipeline`. El repositorio incluye 12 variantes de cuantizacion que van de Q2_K a Q8_0, pasando por IQ4_NL e IQ4_XS.

El modelo base es un sistema de generacion texto-a-video (T2V) y animacion de imagen (I2V) destilado para producir resultados en 5 segundos de inferencia, segun indica el nombre del checkpoint original. El transformer tiene 3.177.988.112 parametros (aproximadamente 3,18 mil millones), un tamano que lo situa en la gama "Lite" de la familia Kandinsky 6.0. Las cuantizaciones reducen el peso del transformer desde 3,2 GB en Q8_0 hasta 1,7 GB en Q2_K, IQ4_NL y Q4_0, lo que facilita su despliegue en GPUs de consumo.

La relevancia de este repositorio es practica: permite ejecutar el componente de difusion del modelo Kandinsky 6.0 Lite con dgenerate u otras herramientas compatibles con GGUF, manteniendo la configuracion del repositorio original. La licencia del modelo fuente se aplica a estos pesos, aunque el autor no la especifica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de difusion (componente `transformer` del pipeline `Kandinsky6TI2VAPipeline`) |
| Parametros totales | 3.177.988.112 (3,18 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF (12 ficheros, uno por cuantizacion) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino cuantizaciones del transformer del modelo base kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers. El componente cuantizado es el transformer del pipeline de difusion `Kandinsky6TI2VAPipeline`, orientado a generacion texto-a-video y animacion de imagen. El modelo base es una variante destilada ("distill-5s") de Kandinsky 6.0 Lite, disenada para reducir el numero de pasos de inferencia a un objetivo de 5 segundos.

La model card no detalla la arquitectura interna del transformer (tipo de atencion, numero de capas, dimensiones ocultas), los datos de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se especifica la innovacion tecnica de la destilacion mas alla del nombre del checkpoint. Lo unico documentado es el proceso de cuantizacion: las 12 variantes GGUF se generaron con dgenerate 6.0.0 mediante el subcomando `quantize`, aplicado al subfolder `transformer` del repositorio original. Los nombres de tensor conservan los del componente original, y la configuracion debe seguir tomandose del repositorio base, pasando el fichero GGUF mediante la opcion de componente correspondiente.

## Capacidades

- Generacion de video a partir de texto (texto-a-video) mediante el pipeline Kandinsky6TI2VAPipeline.
- Animacion de imagen (image-to-video), segun el nombre del pipeline del modelo base.
- Inferencia destilada orientada a 5 segundos por generacion (variante distill-5s).
- Cuantizacion en 12 formatos GGUF para ajustar el equilibrio entre calidad y memoria.
- Compatibilidad con dgenerate 6.0.0 y su subcomando de cuantizacion e inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; el modelo es un generador de video, no un LLM conversacional.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado rapido de video generativo: usar la variante Q8_0 o Q6_K para obtener la mayor fidelidad posible con el transformer cuantizado y validar prompts antes de pasar al modelo sin cuantizar.
- Despliegue en GPU de consumo: las variantes Q4_K (2,3 GB) o IQ4_XS (2,2 GB) permiten cargar el transformer en GPUs con 8-12 GB de VRAM, dejando margen para el resto de componentes del pipeline.
- Pruebas de concepto en portatiles con GPU discreta: Q2_K o IQ4_NL (1,7 GB) reducen al minimo el peso del transformer para entornos con memoria muy limitada.
- Integracion en herramientas de automatizacion con dgenerate: el flujo documentado permite pasar el fichero GGUF como componente y mantener la config del repositorio base, util para pipelines de generacion por lotes.
- Experimentacion con animacion de imagen: emplear el pipeline I2V del modelo base con el transformer cuantizado para generar clips cortos a partir de fotogramas.
- Comparacion de calidad entre cuantizaciones: el repositorio ofrece 12 niveles para medir la degradacion visual de Q2_K a Q8_0 en un mismo prompt.
- Distribucion de pesos ligeros: empaquetar el transformer en 1,7-3,2 GB segun formato para entornos con ancho de banda o almacenamiento restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 1,7 GB (Q2_K, Q4_0, IQ4_NL), 1,9-2,3 GB (Q4_1, Q4_K, Q5_0, Q5_1, IQ4_XS), 2,6 GB (Q5_K), 3,0 GB (Q6_K) y 3,2 GB (Q8_0). Hay que sumar la memoria de los demas componentes del pipeline (VAE, text encoder, etc.), no cuantizados en este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del transformer, cualquier GPU con al menos 8 GB de VRAM deberia poder alojar las variantes mas pequenas junto al resto del pipeline, pero no hay confirmacion del autor.
- GPU de consumo: las variantes Q2_K a Q4_K (1,7-2,3 GB) son las mas adecuadas para GPUs de consumo; Q8_0 (3,2 GB) tambien es viable en GPUs con 12 GB o mas si el resto del pipeline cabe en memoria.
- Opciones de despliegue: dgenerate 6.0.0 (herramienta con la que se generaron las cuantizaciones). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; estos ultimos estan orientados a LLM y no al pipeline de difusion de Kandinsky.
- Latencia y throughput: no disponible. El modelo base esta destilado para 5 segundos de inferencia, pero no se aportan mediciones para las variantes cuantizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Teriks/Kandinsky-6.0-Lite-distill-5s-quants | 3,18 mil millones (transformer) | no disponible | GGUF (12 variantes) | no disponible (hereda del base) | Cuantizaciones del transformer de Kandinsky 6.0 Lite |
| kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers | 3,18 mil millones (transformer) | no disponible | safetensors / Diffusers | no disponible | Modelo base sin cuantizar |
| Otras cuantizaciones GGUF de video generativo | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre modelos alternativos de la misma categoria con datos verificables de parametros, contexto y rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: solo contiene el transformer cuantizado. Requiere el repositorio base kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers para la configuracion y el resto de componentes del pipeline.
- La cuantizacion introduce perdida de calidad respecto al modelo original; las variantes Q2_K e IQ4_NL son las mas agresivas y pueden degradar notablemente la fidelidad del video generado.
- No se especifica la licencia en la model card; el autor indica que se aplica la licencia del modelo fuente, que debe consultarse antes de cualquier uso comercial.
- No hay datos de sesgos, alucinacion visual ni limitaciones de idioma documentados por el autor.
- No se documentan requisitos de hardware, latencia ni compatibilidad con frameworks distintos de dgenerate.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El modelo base es una variante destilada para 5 segundos; no se garantiza que las cuantizaciones mantengan ese objetivo de latencia en todos los entornos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Kandinsky-6.0-Lite-distill-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
