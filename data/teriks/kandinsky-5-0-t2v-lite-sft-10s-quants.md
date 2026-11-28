# Teriks/Kandinsky-5.0-T2V-Lite-sft-10s-quants

## Resumen

Teriks/Kandinsky-5.0-T2V-Lite-sft-10s-quants es un conjunto de cuantizaciones del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Lite SFT 10s, desarrollado originalmente por Kandinsky Lab y publicado en formato Diffusers. Este repositorio, mantenido por el usuario Teriks, no contiene un modelo nuevo sino versiones comprimidas del transformer del modelo base, generadas con la herramienta dgenerate 6.0.0, para facilitar su despliegue en entornos con recursos limitados.

El modelo base es un sistema de difusion texto-a-video capaz de generar clips de hasta 10 segundos a partir de una descripcion textual. El componente cuantizado es el transformer tridimensional (`Kandinsky5Transformer3DModel`), que constituye el nucleo computacional de la pipeline `Kandinsky5T2VPipeline`. El repositorio ofrece doce formatos GGUF (desde Q2_K hasta Q8_0, incluyendo variantes IQ4) y dos cuantizaciones safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise).

La relevancia de este repositorio radica en que reduce el peso del transformer desde los aproximadamente 2.007 millones de parametros del modelo original hasta ficheros de entre 638 MB y 2,0 GB segun el formato, lo que permite ejecutar generacion de video en GPUs de consumo. Es, por tanto, un recurso practico para desarrolladores que quieran integrar Kandinsky 5.0 en flujos de trabajo con ComfyUI o llama.cpp sin disponer de hardware de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (`Kandinsky5Transformer3DModel`) para texto-a-video |
| Parametros totales | 2.007.702.848 (componente transformer del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | la del modelo base (no especificada en la informacion disponible) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo base es un sistema de difusion texto-a-video construido sobre un transformer tridimensional, identificado en la model card como `Kandinsky5Transformer3DModel` dentro de la pipeline `Kandinsky5T2VPipeline`. La variante "Lite" y el sufijo "sft-10s" indican una version afinada mediante supervised fine-tuning orientada a la generacion de clips de 10 segundos. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO.

Este repositorio no entrena ni modifica la arquitectura: aplica cuantizacion post-entrenamiento sobre los pesos del transformer original mediante dgenerate 6.0.0. Las cuantizaciones GGUF siguen el esquema de llama.cpp (incluyendo las variantes IQ4 con cuantizacion por importancia) y las safetensors emplean nombres de tensor compatibles con ComfyUI. Los ficheros con sufijo `-comfy` usan la nomenclatura de tensores de ComfyUI y los `-llama` la de llama.cpp; el resto conserva los nombres originales del componente.

## Capacidades

- Generacion de video a partir de texto (texto-a-video) con clips de hasta 10 segundos.
- Generacion condicionada por prompt textual, heredada de la pipeline `Kandinsky5T2VPipeline`.
- Ejecucion en formatos GGUF para motores compatibles con llama.cpp y en safetensors para ComfyUI.
- Cuantizacion flexible: doce niveles GGUF y dos variantes safetensors para ajustar calidad y VRAM.
- Integracion con flujos de trabajo de ComfyUI mediante los ficheros `-comfy.safetensors`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de video en GPU de consumo: gracias a las cuantizaciones Q4_K (1,1 GB) o IQ4_XS (1,0 GB), el transformer puede cargarse en GPUs con 8-12 GB de VRAM, permitiendo prototipar clips de 10 segundos sin hardware profesional.
- Creacion de contenido para redes sociales: un estudio pequeno puede generar clips cortos a partir de descripciones textuales usando la variante Q8_0 (2,0 GB) para maximizar fidelidad visual dentro de un presupuesto de VRAM moderado.
- Integracion en ComfyUI: los ficheros `transformer-float8_e4m3fn-comfy.safetensors` e `transformer-int8_tensorwise-comfy.safetensors` se cargan directamente en nodos de ComfyUI, lo que permite encadenar el modelo con upscalers, interpoladores y otros nodos del ecosistema.
- Previsualizacion rapida en pipelines de produccion: usar Q2_K (638 MB) para generar borradores de video de baja calidad y validar prompts antes de renderizar con el modelo completo o con Q8_0.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio ofrece catorce variantes del mismo transformer, lo que permite estudiar el impacto de cada formato en la calidad del video generado con una comparacion controlada.
- Despliegue en entornos con VRAM muy limitada: la variante IQ4_XS (1,0 GB) posibilita ejecutar el transformer en GPUs de 6-8 GB combinada con los demas componentes de la pipeline en cuantizaciones agresivas.
- Automatizacion de generacion de video por lotes: mediante dgenerate o llama.cpp se pueden lanzar trabajos por linea de comandos sobre los ficheros GGUF, integrandolos en scripts de renderizado masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: entre 0,6 GB (Q2_K) y 2,0 GB (Q8_0) solo para los pesos; hay que sumar la VRAM del text encoder, el VAE y los buffers de activacion de la pipeline completa.
- La pipeline completa de Kandinsky 5.0 T2V requiere ademas los componentes de texto y decodificacion, por lo que la VRAM total supera ampliamente la del transformer cuantizado.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para la pipeline completa; las cuantizaciones Q4_K e IQ4_XS permiten acercarse a GPUs de 8-12 GB si el resto de componentes se cuantiza tambien.
- Cabe en GPU de consumo: si, al menos el transformer; la viabilidad de la pipeline completa depende de la cuantizacion del resto de componentes.
- Opciones de despliegue: ComfyUI (safetensors `-comfy`), llama.cpp y motores compatibles con GGUF, y dgenerate 6.0.0 como herramienta de cuantizacion y ejecucion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Lite-sft-10s-quants | 2.007.702.848 | no disponible | GGUF (12) y safetensors (2) | la del modelo base | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2V-Lite-sft-10s-Diffusers | 2.007.702.848 | no disponible | safetensors (Diffusers) | no disponible | Hugging Face |
| Otros modelos texto-a-video de la familia Kandinsky 5.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a sus cuantizaciones, ya que la informacion proporcionada no incluye datos de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Este repositorio contiene unicamente el transformer cuantizado; no es un modelo autonomo y requiere el repositorio original para obtener la configuracion y el resto de componentes de la pipeline.
- La licencia del modelo base se aplica a estos pesos, pero no se especifica en la informacion disponible; es necesario consultar el repositorio original antes de un uso comercial.
- Las cuantizaciones agresivas (Q2_K, Q3_K, IQ4_XS) pueden degradar la calidad del video generado; no se han publicado evaluaciones cuantitativas de esa perdida.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base; no hay informacion sobre evaluaciones de sesgo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La fecha de creacion (2026-11-28) y la ausencia de benchmarks publicados impiden confirmar el rendimiento real en produccion.
- No se dispone de informacion sobre idiomas soportados, contexto de texto de entrada ni requisitos exactos de la pipeline completa.
- El uso de ficheros con nomenclatura incorrecta (por ejemplo, cargar un `-llama` en ComfyUI) puede provocar errores de carga de tensores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Lite-sft-10s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-sft-10s-Diffusers
- Herramienta de cuantizacion dgenerate: https://github.com/Teriks/dgenerate
