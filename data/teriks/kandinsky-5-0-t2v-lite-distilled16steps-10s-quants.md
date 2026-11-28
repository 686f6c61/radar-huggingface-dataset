# Teriks/Kandinsky-5.0-T2V-Lite-distilled16steps-10s-quants

## Resumen

Teriks/Kandinsky-5.0-T2V-Lite-distilled16steps-10s-quants es un conjunto de cuantizaciones del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Lite, publicado por el desarrollador Teriks (autor de la herramienta dgenerate) a partir del modelo original de kandinskylab. El repositorio no contiene un modelo nuevo, sino los pesos del transformer del pipeline `Kandinsky5T2VPipeline` (`Kandinsky5Transformer3DModel`) convertidos a multiples formatos comprimidos para reducir los requisitos de memoria en inferencia.

El modelo base es una variante "Lite" destilada que genera clips de video de hasta 10 segundos a partir de una descripcion textual, empleando una destilacion que permite muestrear en solo 16 pasos. El transformer contiene aproximadamente 2.007 millones de parametros (unos 2.000 millones, es decir, 2 B) segun los pesos en safetensors del modelo original. Este repositorio ofrece esos mismos pesos en 12 formatos GGUF (de Q2_K a IQ4_XS) y en dos formatos safetensors de ComfyUI (float8_e4m3fn e int8_tensorwise), lo que permite ejecutar el modelo en GPUs con menos VRAM.

La relevancia de esta ficha es practica: el repositorio es un artefacto de cuantizacion, no un modelo autonomo. Para usarlo hay que mantener el repositorio original como modelo y cargar el archivo de cuantizacion en la opcion del componente correspondiente, de modo que la configuracion siga proviniendo del repositorio base. La licencia del modelo fuente se aplica a estos pesos, aunque en la informacion disponible no se detalla cual es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D para difusion texto-a-video (`Kandinsky5Transformer3DModel`) |
| Parametros totales | 2.007.702.848 (aprox. 2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF y safetensors (nombres de tensor nativos, ComfyUI `-comfy` y llama.cpp `-llama`) |

## Arquitectura y entrenamiento

El componente cuantizado es el transformer de difusion del pipeline `Kandinsky5T2VPipeline`, un modelo de difusion para generacion de video a partir de texto con arquitectura transformer tridimensional (`Kandinsky5Transformer3DModel`). El modelo base es una variante destilada ("distilled16steps") que reduce el numero de pasos de muestreo a 16, lo que disminuye el coste computacional por clip. La salida son videos de hasta 10 segundos de duracion, segun indica el nombre del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento en la informacion proporcionada. La model card del repositorio de cuantizacion solo documenta el proceso de conversion: los pesos se generaron con dgenerate 6.0.0 mediante el subcomando `quantize`, aplicado al subfolder `transformer` del modelo base, con salida en formatos ComfyUI y subida automatica a Hugging Face.

## Capacidades

- Generacion de video texto-a-video: produce clips de hasta 10 segundos a partir de una descripcion textual, usando el pipeline `Kandinsky5T2VPipeline`.
- Muestreo destilado en 16 pasos: el modelo base esta destilado para reducir el numero de pasos de difusion, lo que acelera la inferencia frente a modelos no destilados.
- Cuantizacion flexible: 12 formatos GGUF y 2 formatos safetensors de ComfyUI permiten ajustar el equilibrio entre calidad y memoria.
- Compatibilidad con ComfyUI: los archivos `-comfy` usan nombres de tensor de ComfyUI y los `float8_e4m3fn`/`int8_tensorwise` estan pensados para ese entorno.
- Compatibilidad con llama.cpp: los archivos `-llama` usan nombres de tensor de llama.cpp.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de video en GPUs de consumo: cargando `transformer-Q4_K.gguf` (1,1 GB) o `transformer-IQ4_XS.gguf` (1,0 GB) junto al repositorio base, se puede ejecutar el pipeline en GPUs con 8-12 GB de VRAM, algo inviable con los pesos completos en muchos equipos.
- Prototipado rapido de clips publicitarios: el muestreo en 16 pasos y los formatos Q4 permiten iterar sobre guiones y prompts en minutos, generando clips de 10 segundos para revision creativa.
- Integracion en ComfyUI: los archivos `transformer-float8_e4m3fn-comfy.safetensors` e `transformer-int8_tensorwise-comfy.safetensors` se cargan directamente en flujos de ComfyUI, lo que facilita montar pipelines de generacion de video con nodos existentes.
- Despliegue en servidores con VRAM limitada: `transformer-Q8_0.gguf` (2,0 GB) ofrece una cuantizacion de alta fidelidad para servidores con 16-24 GB de VRAM que no pueden alojar los pesos en bf16/fp16.
- Experimentacion en investigacion: los 14 archivos de cuantizacion permiten estudiar el impacto de la compresion (de Q2_K a Q8_0) en la calidad del video generado, manteniendo el mismo modelo base.
- Generacion de video en local sin conexion: al ser pesos descargables y ejecutables con llama.cpp o ComfyUI, el modelo puede desplegarse en entornos aislados para generar material audiovisual sin depender de APIs externas.
- Automatizacion de contenido educativo: clips cortos de 10 segundos generados por lotes para ilustrar conceptos, usando los formatos Q4 para maximizar el throughput por GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: entre 0,64 GB (Q2_K) y 2,0 GB (Q8_0) solo para los pesos del transformer; a esto hay que sumar los demas componentes del pipeline (VAE, text encoder) y las activaciones, por lo que el requisito total de VRAM es mayor y no esta detallado en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por el tamano de los pesos cuantizados, el transformer cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 y RTX 4090, siempre que el resto del pipeline quepa en memoria.
- Cabe en consumer GPU: si, al menos el transformer en formatos Q4-Q8; el pipeline completo depende de los componentes adicionales.
- Opciones de despliegue: ComfyUI (archivos `-comfy`), llama.cpp (archivos `-llama`) y dgenerate 6.0.0; vLLM y TGI no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de texto-a-video con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: hay que usar el repositorio base `kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-10s-Diffusers` como modelo y pasar el archivo de cuantizacion con la opcion del componente correspondiente, para que la configuracion siga proviniendo del repositorio original.
- La licencia no esta indicada en la informacion disponible; la model card afirma que se aplica la licencia del modelo fuente, por lo que es imprescindible consultarla antes de un uso comercial.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base en la informacion proporcionada.
- Las cuantizaciones agresivas (Q2_K, Q3_K, IQ4_XS) pueden degradar la calidad del video generado frente a Q8_0 o los pesos originales; no se han publicado evaluaciones cuantitativas de esa degradacion.
- Los nombres de tensor difieren entre archivos (`-comfy` para ComfyUI, `-llama` para llama.cpp, nombres nativos en el resto); usar el archivo equivocado con el runtime incorrecto puede provocar errores de carga.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad de las cuantizaciones.
- No se dispone de datos sobre latencia, throughput ni consumo de VRAM del pipeline completo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Lite-distilled16steps-10s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-10s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
