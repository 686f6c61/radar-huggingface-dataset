# Teriks/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-quants

## Resumen

Kandinsky-5.0-T2V-Lite-distilled16steps-5s-quants es un conjunto de cuantizaciones del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Lite, desarrollado originalmente por el equipo Kandinsky (kandinskylab) y cuantizado por el usuario Teriks mediante la herramienta dgenerate 6.0.0. El modelo base es un transformer de difusion 3D (`Kandinsky5Transformer3DModel`) destilado para generar video en 16 pasos de muestreo y una duracion de 5 segundos a partir de una descripcion textual.

El repositorio no contiene un modelo nuevo, sino el componente transformer del pipeline original convertido a multiples formatos de cuantizacion: 12 variantes GGUF (desde Q2_K hasta IQ4_XS) y dos variantes safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise). El objetivo es reducir el peso del transformer (2.007.702.848 parametros, aproximadamente 2 mil millones) para que pueda ejecutarse en hardware con VRAM limitada, manteniendo la configuracion y el resto de componentes del repositorio original.

Es relevante porque permite desplegar un modelo de generacion de video en GPUs de consumo o en entornos con restricciones de memoria, algo que con los pesos originales en precision completa resulta mas costoso. La cuantizacion mas agresiva (Q2_K) ocupa 638,8 MB, frente a los 2,0 GB de Q8_0, lo que abre la puerta a inferencia local de texto-a-video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (`Kandinsky5Transformer3DModel`), destilado |
| Parametros totales | 2.007.702.848 (componente transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica que aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion 3D para generacion de video texto-a-video, integrado en el pipeline `Kandinsky5T2VPipeline`. La variante "Lite" corresponde a una version reducida del modelo Kandinsky 5.0, y la designacion "distilled16steps" indica que ha sido destilado para requerir solo 16 pasos de muestreo, frente a los muchos mas que necesitaria un modelo de difusion no destilado. La designacion "5s" hace referencia a la duracion del video generado: 5 segundos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, ya que la model card del repositorio de cuantizacion no los detalla. La innovacion principal de este repositorio es la cuantizacion: se ofrecen formatos GGUF con nombres de tensores nativos, con sufijo `-comfy` (nombres de tensores de ComfyUI) y con sufijo `-llama` (nombres de tensores de llama.cpp), lo que facilita la integracion en distintas herramientas de inferencia.

## Capacidades

- Generacion de video texto-a-video: produce clips de 5 segundos a partir de una descripcion textual.
- Muestreo destilado en 16 pasos, lo que reduce el coste computacional de la inferencia.
- Integracion con ComfyUI mediante los archivos safetensors con nombres de tensores compatibles.
- Integracion con llama.cpp y dgenerate mediante los archivos GGUF.
- Soporte de multiples niveles de cuantizacion para ajustar el equilibrio entre calidad y memoria.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking, ya que se trata de un modelo generativo de video, no de un modelo de lenguaje.

## Casos de uso

- Generacion de video local en GPU de consumo: usando las cuantizaciones Q4_K o IQ4_XS (en torno a 1,0-1,1 GB) el transformer puede cargarse en GPUs con 8-12 GB de VRAM junto con el resto del pipeline, permitiendo crear clips de 5 segundos sin depender de servicios en la nube.
- Prototipado rapido de ideas audiovisuales: con la variante Q2_K (638,8 MB) se puede iterar sobre prompts y comprobar resultados preliminares antes de lanzar una generacion de mayor calidad con Q8_0.
- Integracion en flujos de ComfyUI: los archivos `-comfy.safetensors` en float8_e4m3fn e int8_tensorwise se cargan directamente en nodos de ComfyUI, lo que permite encadenar la generacion de video con otros nodos de postprocesado.
- Automatizacion por linea de comandos con dgenerate: el repositorio documenta el uso de dgenerate para cuantizar y puede emplearse para generar lotes de videos en scripts, aprovechando los formatos GGUF con nombres de tensores de llama.cpp.
- Despliegue en entornos con VRAM limitada o multiples instancias: al reducir el peso del transformer a 1-2 GB, es viable ejecutar varias instancias o compartir GPU entre tareas, algo inviable con pesos en precision completa.
- Investigacion sobre cuantizacion de modelos de difusion de video: la disponibilidad de 12 formatos GGUF permite comparar la degradacion de calidad y el ahorro de memoria entre esquemas de cuantizacion en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun cuantizacion: Q2_K 638,8 MB; Q3_K 832,9 MB; Q4_0, Q4_K e IQ4_NL 1,1 GB; Q4_1 1,2 GB; Q5_0, Q5_K 1,3 GB; Q5_1 1,4 GB; Q6_K 1,5 GB; Q8_0 2,0 GB; float8_e4m3fn e int8_tensorwise 1,9 GB.
- La VRAM total necesaria incluye ademas el resto de componentes del pipeline (VAE, codificador de texto, etc.), cuyo tamano no se detalla en la informacion disponible.
- GPU recomendadas: no disponibles de forma especifica; por el tamano del transformer cuantizado, es plausible su uso en RTX 3060/4060/4090 y GPUs de datacenter como A100 o H100, pero no se aportan cifras oficiales.
- Cabe en GPU de consumo: si, al menos el componente transformer en las cuantizaciones bajas; el pipeline completo depende de los demas componentes.
- Opciones de despliegue: dgenerate (herramienta de cuantizacion e inferencia), llama.cpp (archivos con sufijo `-llama`), ComfyUI (archivos `-comfy.safetensors`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-5.0-T2V-Lite-distilled16steps-5s-quants (este) | 2.007.702.848 | no disponible | GGUF (12) + safetensors (2) | no disponible (la del modelo fuente) | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-Diffusers (modelo base) | no disponible en la informacion | no disponible | pesos originales | no disponible | Hugging Face |
| Otros modelos T2V de la familia Kandinsky 5.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio solo contiene el componente transformer cuantizado; es necesario usar el repositorio original como modelo base y pasar el archivo de cuantizacion con la opcion de componente correspondiente para que la configuracion se cargue correctamente.
- La cuantizacion introduce perdida de calidad respecto a los pesos originales; las variantes Q2_K y Q3_K son las mas agresivas y previsiblemente las que mas degradan el resultado.
- La licencia del modelo fuente aplica a estos pesos, pero no se especifica cual es en la informacion disponible; es imprescindible consultar la licencia del repositorio original antes de un uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma del modelo base en la informacion proporcionada.
- El modelo genera video de 5 segundos; no se documenta soporte para duraciones mayores ni para otras modalidades.
- No se aportan datos de benchmarks, latencia ni throughput, por lo que la evaluacion de calidad debe realizarse empiricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
