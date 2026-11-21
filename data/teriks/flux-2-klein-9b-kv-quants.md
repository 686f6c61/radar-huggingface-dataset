# Teriks/FLUX.2-klein-9B-KV-quants

## Resumen

Teriks/FLUX.2-klein-9B-KV-quants es un repositorio de pesos cuantizados del modelo de difusion `black-forest-labs/FLUX.2-klein-9b-kv`, generado con la herramienta dgenerate 6.0.0. No se trata de un modelo entrenado de forma independiente, sino de una conversion de los pesos originales del transformer (`Flux2Transformer2DModel`) a dos formatos de cuantizacion orientados a ComfyUI: `float8_e4m3fn` e `int8_tensorwise`. El objetivo es reducir el coste de VRAM del modelo base para facilitar su ejecucion en GPUs de consumo y en entornos de generacion de imagenes con ComfyUI.

El modelo base pertenece a la familia FLUX.2 de Black Forest Labs, en su variante "klein" de 9B parametros con atencion KV, segun se deduce del identificador `FLUX.2-klein-9b-kv`. Se trata por tanto de un modelo de difusion texto-a-imagen, no de un modelo de lenguaje, y su uso previsto es la generacion de imagenes condicionada por prompts de texto dentro del ecosistema ComfyUI.

La relevancia de este repositorio es practica: ofrece pesos ya cuantizados y listos para cargar en ComfyUI sin necesidad de ejecutar el proceso de cuantizacion localmente. El autor indica explicitamente que la licencia del modelo de origen se aplica a estos pesos, y no se publican datos de rendimiento, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (`Flux2Transformer2DModel`) segun el modelo base |
| Parametros totales | 9B (segun el identificador del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `float8_e4m3fn`, `int8_tensorwise` (safetensors ComfyUI) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo de origen) |
| Formato de pesos | safetensors con layout ComfyUI (`--comfy`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion post-entrenamiento del transformer del modelo base `black-forest-labs/FLUX.2-klein-9b-kv`. Segun la model card, el componente cuantizado es el `transformer` (`Flux2Transformer2DModel`), y el pipeline asociado es `Flux2KleinPipeline`. Se trata, por tanto, de un modelo de difusion para generacion de imagenes, no de un modelo autorregresivo de lenguaje.

La cuantizacion se realizo con dgenerate 6.0.0 mediante el subcomando `quantize`, con `--subfolders transformer`, `--formats comfy` y `--comfy`. Los pesos resultantes siguen el layout de nombres de tensor de ComfyUI, de modo que ComfyUI y ComfyUI-GGUF pueden cargarlos siempre que exista un key map para esa arquitectura; un componente sin key map se considera un error. No se proporcionan datos sobre el dataset de entrenamiento del modelo base, numero de tokens, composicion, ni sobre tecnicas de RLHF/DPO, por lo que esa informacion debe consultarse en el repositorio de origen.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, heredada del modelo base FLUX.2-klein-9b-kv.
- Carga directa en ComfyUI mediante safetensors con layout ComfyUI.
- Dos variantes de cuantizacion (`float8_e4m3fn` e `int8_tensorwise`) para ajustar el uso de VRAM.
- Compatibilidad con ComfyUI-GGUF cuando existe key map para la arquitectura.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking, ya que es un modelo de difusion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en ComfyUI con VRAM limitada: cargar `transformer-float8_e4m3fn-comfy.safetensors` o `transformer-int8_tensorwise-comfy.safetensors` junto con el repositorio original como modelo permite reducir el peso del transformer respecto a los pesos sin cuantizar.
- Prototipado rapido de pipelines texto-a-imagen: al mantener el repositorio de origen como modelo y pasar solo el fichero cuantizado con la opcion de componente correspondiente, se conserva la configuracion original y se acelera la puesta en marcha.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante `float8_e4m3fn` de 8,5 GB permite alojar el transformer en GPUs con 12-16 GB de VRAM, dejando margen para el resto del pipeline.
- Evaluacion comparativa de cuantizaciones: disponer de dos formatos del mismo modelo facilita medir el impacto en calidad y velocidad de `float8_e4m3fn` frente a `int8_tensorwise` en un mismo flujo de ComfyUI.
- Integracion en flujos de trabajo de ComfyUI existentes: los nombres de tensor siguen el layout ComfyUI, por lo que se pueden sustituir los pesos del transformer sin reescribir los grafos.
- Reproducibilidad de cuantizaciones: la model card documenta el comando exacto de dgenerate empleado, lo que permite regenerar los pesos o auditar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: cada fichero de cuantizacion del transformer ocupa 8,5 GB en disco; la VRAM necesaria en inferencia sera igual o superior a ese tamano mas el resto de componentes del pipeline (VAE, text encoder), que no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: presumiblemente en GPUs con 12-16 GB o mas de VRAM, aunque no se confirma en la model card.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF, segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/FLUX.2-klein-9B-KV-quants | 9B (base) | no disponible | safetensors ComfyUI (fp8, int8) | la del modelo de origen | Hugging Face |
| black-forest-labs/FLUX.2-klein-9b-kv | 9B | no disponible | safetensors sin cuantizar | no disponible | Hugging Face |
| Otras cuantizaciones Comunitarias de FLUX.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un repositorio de cuantizacion, no un modelo entrenado: la calidad final depende del modelo base y del error introducido por la cuantizacion.
- No se publican evaluaciones de degradacion de calidad para `float8_e4m3fn` ni `int8_tensorwise`.
- La licencia no se especifica en el repositorio; el autor remite a la licencia del modelo de origen, que debe verificarse antes de cualquier uso comercial.
- Requiere cargar el repositorio original como modelo y pasar el fichero cuantizado con la opcion de componente correspondiente; usarlo de forma aislada puede provocar errores de configuracion.
- ComfyUI y ComfyUI-GGUF solo cargan los ficheros si existe un key map para la arquitectura; un componente sin key map es un error.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma del modelo base en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/FLUX.2-klein-9B-KV-quants
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9b-kv
- Herramienta de cuantizacion dgenerate: https://github.com/Teriks/dgenerate
