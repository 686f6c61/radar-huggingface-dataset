# Teriks/HunyuanVideo-1.5-480p-T2V-quants

## Resumen

Teriks/HunyuanVideo-1.5-480p-T2V-quants es un repositorio de pesos cuantizados del modelo de generacion de video texto-a-video HunyuanVideo 1.5, en su variante de 480p, publicado por el desarrollador Teriks. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales de `hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v` a formatos de menor precision para facilitar su despliegue en hardware con recursos limitados. La cuantizacion se ha realizado con la herramienta dgenerate 6.0.0 y esta orientada al ecosistema ComfyUI.

El modelo base es un transformer de difusion 3D (`HunyuanVideo15Transformer3DModel`) que genera clips de video a partir de descripciones textuales en resolucion 480p. Este repositorio contiene unicamente el componente `transformer` cuantizado, no el pipeline completo, por lo que es necesario mantener el repositorio original como modelo de referencia y cargar estos pesos como sustituto del transformer.

La relevancia de esta publicacion radica en que reduce el peso del transformer a 7,8 GB por archivo en formatos float8_e4m3fn e int8_tensorwise, lo que abarata considerablemente los requisitos de VRAM frente a los pesos en precision completa. El repositorio tiene un tamano total de 16,7 GB y, en el momento de la consulta, registraba 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (`HunyuanVideo15Transformer3DModel`), componente `transformer` del pipeline `HunyuanVideo15Pipeline` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `float8_e4m3fn` y `int8_tensorwise` (formato ComfyUI safetensors); la herramienta admite ademas Q4_K (`q4`) y Q8_0 (`q8`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica que aplica la licencia del modelo original) |
| Formato de pesos | safetensors (layout ComfyUI): `transformer-float8_e4m3fn-comfy.safetensors` (7,8 GB) y `transformer-int8_tensorwise-comfy.safetensors` (7,8 GB) |

## Arquitectura y entrenamiento

El componente cuantizado corresponde al transformer de difusion 3D del modelo HunyuanVideo 1.5, la variante texto-a-video en 480p. Se trata de un modelo de difusion para generacion de video, no de un modelo autorregresivo de lenguaje, por lo que no dispone de ventana de contexto textual ni de parametros activos en el sentido de un MoE. La model card del repositorio no detalla el numero de parametros del transformer original, la composicion del dataset de entrenamiento ni si hubo etapas de ajuste fino.

La innovacion de este repositorio no reside en el entrenamiento, sino en la cuantizacion. Los pesos originales se han convertido a `float8_e4m3fn` e `int8_tensorwise` mediante dgenerate 6.0.0, con nombres de tensor en el layout de ComfyUI (`--comfy`). Segun la model card, ComfyUI y ComfyUI-GGUF cargan los archivos que disponen de key map para la arquitectura, y un componente sin key map se considera un error. No se aportan datos sobre el proceso de calibracion de la cuantizacion ni sobre la perdida de calidad resultante.

## Capacidades

- Generacion de video a partir de texto (texto-a-video) en resolucion 480p, heredada del modelo base HunyuanVideo 1.5.
- Ejecucion del transformer cuantizado en ComfyUI, sustituyendo los pesos en precision completa por los archivos float8 o int8.
- Compatibilidad con el pipeline `HunyuanVideo15Pipeline` de Diffusers, manteniendo la configuracion del repositorio original.
- Carga mediante ComfyUI y ComfyUI-GGUF a traves del key map de la arquitectura.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento, al tratarse de un modelo de generacion de video.

## Casos de uso

- Generacion de clips de video 480p en ComfyUI: se cargan los pesos cuantizados en float8_e4m3fn como sustituto del transformer original, reduciendo el peso del componente a 7,8 GB y permitiendo ejecutar el pipeline en GPUs con menos VRAM.
- Prototipado de flujos texto-a-video en estaciones de trabajo: el formato int8_tensorwise ofrece una alternativa de menor huella para iterar sobre prompts y configuraciones antes de pasar a produccion con pesos completos.
- Integracion en pipelines de Diffusers: al conservar la configuracion del repositorio base, el transformer cuantizado puede inyectarse en `HunyuanVideo15Pipeline` para generar video desde texto en entornos de investigacion.
- Despliegue en hardware de consumo: la reduccion a 7,8 GB por archivo facilita probar el modelo en GPUs consumer con suficiente VRAM, algo inviable con los pesos en precision completa.
- Evaluacion comparativa de cuantizaciones: el repositorio permite contrastar la calidad visual de las variantes float8 e int8 frente al modelo original en la misma resolucion de 480p.
- Automatizacion de generacion de video por lotes: mediante scripts que invocan ComfyUI o Diffusers con los pesos cuantizados para producir clips cortos de forma repetida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad visual, FVD, CLIP score ni comparaciones con el modelo en precision completa.

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado ocupa 7,8 GB por archivo; a ello hay que sumar el resto de componentes del pipeline (VAE, text encoder), no incluidos en este repositorio, por lo que la VRAM total de inferencia es superior y no esta cuantificada en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por el tamano del componente, se requiere una GPU con al menos 8 GB de VRAM solo para el transformer, y mas para el pipeline completo.
- GPU consumer: probable en tarjetas con 12-16 GB o mas de VRAM al usar los pesos cuantizados junto con el resto del pipeline, aunque no se confirma en la documentacion.
- Opciones de despliegue: ComfyUI, ComfyUI-GGUF y Diffusers (`HunyuanVideo15Pipeline`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/HunyuanVideo-1.5-480p-T2V-quants | Cuantizacion del transformer de HunyuanVideo 1.5 480p | 480p | float8_e4m3fn / int8_tensorwise, 7,8 GB | no disponible | Hugging Face, 0 descargas |
| hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v | Modelo base original | 480p | precision completa (no disponible el tamano exacto) | no disponible | Hugging Face |
| Otras cuantizaciones de HunyuanVideo 1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros (por ejemplo, otras familias texto-a-video) en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a float8 e int8 puede degradar la calidad del video generado respecto al modelo en precision completa; no se documenta el grado de perdida.
- El repositorio contiene solo el componente `transformer`; es imprescindible mantener el repositorio original para obtener la configuracion y el resto de componentes del pipeline.
- Los archivos usan el layout de ComfyUI; cargarlos en un componente sin key map para la arquitectura provoca un error.
- La licencia no esta indicada en el repositorio; la model card senala que se aplica la licencia del modelo original, que debe consultarse antes de cualquier uso comercial.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion visual.
- El repositorio registra 0 descargas, por lo que no hay evidencia de uso en produccion ni validacion comunitaria de los pesos.
- No se detallan los datos de calibracion ni garantias de reproducibilidad del proceso de cuantizacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Teriks/HunyuanVideo-1.5-480p-T2V-quants
- Modelo base: https://huggingface.co/hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v
- Herramienta de cuantizacion dgenerate: https://github.com/Teriks/dgenerate
