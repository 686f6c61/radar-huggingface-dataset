# Wh1teSpaces/Ejen-Kim

## Resumen

Ejen-Kim es un adaptador LoRA para modelos de difusion de texto a imagen basados en Stable Diffusion XL, desarrollado por el usuario Wh1teSpaces. Se entrena sobre el modelo base `Wh1teSpaces/OrthogonalDiffusion-XL`, en su variante `OD_XL_v0_3_IllustriousStyle_Boost_fp16.safetensors`, y esta orientado a la generacion de imagenes de estilo anime con un personaje concreto denominado "Ejen Kim". El repositorio tiene un tamano de 0,3 GB y no registra descargas ni interacciones en el momento de la consulta.

El adaptador se ha generado mediante el flujo automatizado "Universal SDXL LoRA Training Workflow v1.2.0" a partir de un dataset de solo 16 imagenes etiquetadas (`Bl4ckSpaces/Ejen-Kim-Char-Tagged-v2`). Con rango 8 y alpha 16, 1000 pasos totales y una perdida minima de 0,042633 en la epoca 57, se trata de un ajuste ligero y muy especializado, no de un modelo de proposito general.

Su relevancia es limitada y acotada: sirve como ejemplo de LoRA de personaje para SDXL y como pieza dentro del ecosistema de modelos derivados de OrthogonalDiffusion-XL. No dispone de ficha tecnica ampliada, benchmarks ni documentacion sobre licencia comercial, por lo que su evaluacion en produccion exige cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion SDXL |
| Parametros totales | no disponible (rango LoRA 8, alpha 16; tamano del repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; no disponible la longitud de prompt recomendada) |
| Tipos de cuantizacion | no disponible (el modelo base referenciado es fp16) |
| Idiomas soportados | no disponible (los prompts de texto a imagen dependen del codificador de texto del modelo base) |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | no disponible (el repo contiene pesos LoRA; no se explicita safetensors ni otro formato) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 y alpha 16 aplicado sobre un UNet de Stable Diffusion XL (arquitectura de difusion latente con codificador de texto dual). El entrenamiento se realizo con el workflow "Universal SDXL LoRA Training Workflow v1.2.0" usando el optimizador PagedAdamW8bit, una tasa de aprendizaje de 0,0001, batch size 2 y 1000 pasos totales, lo que equivale a 125 epocas efectivas sobre un dataset de 16 imagenes. La resolucion de entrenamiento se gestiono en modo `native_pad8`.

No se aplico poda (`pruning mode: skip`, 0 rondas) ni se eliminaron etiquetas unicas del dataset. La perdida minima registrada fue de 0,042633 en la epoca 57, mientras que la perdida final (media de las ultimas 20) fue de 0,110357, lo que sugiere cierto sobreajuste tras el minimo. No hay informacion sobre volumen de tokens, composicion del dataset mas alla del numero de imagenes, ni sobre tecnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por el modelo base SDXL.
- Especializacion en un personaje concreto ("Ejen Kim") de estetica anime, segun la descripcion del modelo en PixAI.
- No requiere palabra de activacion (trigger word: `none`), por lo que el estilo del personaje se invoca mediante el propio prompt.
- Compatible con el ecosistema de herramientas SDXL (interfaces de difusion, nodos de ComfyUI, scripts de Automatic1111) siempre que se cargue junto al modelo base correcto.
- No dispone de tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del modelo base.

## Casos de uso

- Generacion de ilustraciones de personaje consistente: al estar entrenado sobre un unico personaje, permite producir variaciones de pose, vestuario e iluminacion manteniendo rasgos reconocibles en un pipeline de SDXL.
- Prototipado rapido de arte para proyectos de animacion: con 16 imagenes de referencia y un LoRA ligero, un estudio pequeno puede validar el diseno de un personaje antes de invertir en un modelo mayor.
- Creacion de contenido para comunidades de fan art: el modelo aparece listado en PixAI como recurso de generacion de arte anime, lo que encaja con flujos de publicacion en plataformas de arte generativo.
- Pruebas de concepto de entrenamiento LoRA: sirve como caso de estudio reproducible del workflow v1.2.0, con hiperparametros y curvas de perdida documentados.
- Integracion en pipelines de generacion por lotes: al ser un adaptador de 0,3 GB, se puede cargar y descargar rapidamente en entornos con multiples LoRAs de personaje.
- Investigacion sobre sobreajuste en datasets pequenos: la diferencia entre la perdida minima (epoca 57) y la final (ultimas 20) permite analizar el efecto del numero de epocas en LoRAs de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; al operar sobre SDXL en fp16, se requiere el espacio del modelo base completo (aproximadamente 6-8 GB en fp16 para el UNet y los codificadores de texto, segun la implementacion).
- GPU recomendadas: no disponible; por herencia del modelo base SDXL, son adecuadas GPU con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 8 GB de VRAM, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: no documentadas para este adaptador; al ser un LoRA SDXL, es compatible con Automatic1111, ComfyUI, Diffusers y otros entornos que carguen LoRAs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wh1teSpaces/Ejen-Kim | LoRA SDXL de personaje | no disponible (rango 8) | no aplica | other | Hugging Face, 0 descargas |
| Bl4ckSpaces/Ejen-Kim-LoRA-V1 | LoRA SDXL de personaje | no disponible | no aplica | no disponible | Hugging Face |
| Wh1teSpaces/OrthogonalDiffusion-XL | Modelo base SDXL | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (16 imagenes), lo que incrementa el riesgo de sobreajuste y de perdida de diversidad en las generaciones.
- La perdida final (0,110357) es mas del doble que la minima (0,042633), indicio de sobreentrenamiento en las ultimas epocas.
- No hay palabra de activacion, por lo que el control sobre la aparicion del personaje depende completamente de la formulacion del prompt.
- Licencia "other" sin terminos explicitos: no se puede confirmar el uso comercial ni la redistribucion.
- Sin informacion sobre sesgos, composicion del dataset ni procedencia de las imagenes de entrenamiento.
- Sin benchmarks ni evaluaciones cualitativas publicadas; el unico indicador de calidad es la curva de perdida.
- Dependencia estricta del modelo base `OrthogonalDiffusion-XL` en su variante v0.3; su uso con otros checkpoints SDXL puede degradar el resultado.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- [Wh1teSpaces/Ejen-Kim en Hugging Face](https://huggingface.co/Wh1teSpaces/Ejen-Kim)
- [Bl4ckSpaces/Ejen-Kim-LoRA-V1 en Hugging Face](https://huggingface.co/Bl4ckSpaces/Ejen-Kim-LoRA-V1)
- [Ejen Kim en PixAI](https://pixai.art/kr/model/1744379043046733035)
