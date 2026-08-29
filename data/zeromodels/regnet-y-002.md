# zeromodels/regnet-y-002

## Resumen

`zeromodels/regnet-y-002` es una conversión pura en Keras 3 del checkpoint original `facebook/regnet-y-002`, un modelo de clasificación de imágenes y backbone convolucional perteneciente a la familia RegNet. Esta familia de ConvNets, presentada en el paper "Designing Network Design Spaces" (arXiv:2003.13678), se caracteriza por seguir una regla cuantizada-lineal simple para determinar la anchura y profundidad de cada etapa, lo que permite explorar sistemáticamente el espacio de diseño de redes neuronales.

La variante Y incorpora bloques residuales con Squeeze-and-Excitation (SE), lo que mejora la representación de características con un coste computacional moderado. Este modelo en concreto, el `regnet-y-002`, es la variante más pequeña de la familia Y, con aproximadamente 2 millones de parámetros, diseñada para tareas de clasificación de imágenes a resolución 224x224 o como extractor de características de cuatro etapas.

La relevancia de este checkpoint radica en su portabilidad: al ser una implementación Keras 3, el mismo código puede ejecutarse sin modificaciones en TensorFlow, PyTorch o JAX, lo que facilita su integración en pipelines existentes. Es una opción ligera y eficiente para prototipado rápido, fine-tuning o como backbone en tareas de visión por computador donde los recursos computacionales son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNetY (ConvNet con bloques residuales y Squeeze-and-Excitation) |
| Parametros totales | ~2 millones (inferido del nombre "002"; no disponible en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (HDF5/weights), compatible con safetensors via conversion |

## Arquitectura y entrenamiento

La arquitectura RegNetY sigue el diseño propuesto en el paper "Designing Network Design Spaces". El modelo comienza con un stem de convolucion 3x3 con stride 2, seguido de cuatro etapas de bloques residuales. Cada bloque residual sigue el patron `1x1 -> 3x3 grouped -> [SE] -> 1x1`, donde la variante Y incorpora una capa de Squeeze-and-Excitation que recalibra los canales de forma adaptativa. Las anchuras y profundidades de cada etapa siguen una regla cuantizada-lineal, lo que permite un escalado sistematico del modelo.

El checkpoint original `facebook/regnet-y-002` fue entrenado en ImageNet-1K para clasificacion de 1000 clases. La conversion de zeromodels mantiene los pesos originales y los empaqueta en una implementacion Keras 3 que soporta los tres backends principales (TensorFlow, PyTorch y JAX). La normalizacion de imagenes esta integrada en el modelo (`include_normalization=True`), por lo que acepta pixeles crudos en rango [0, 255] sin preprocesamiento adicional.

## Capacidades

- Clasificacion de imagenes: devuelve logits de 1000 clases de ImageNet.
- Extraccion de caracteristicas: modo backbone con salidas multiescala en strides 4, 8, 16 y 32.
- Soporte de formatos de canales: tanto `channels_last` como `channels_first`, con resultados bit-exactos.
- Multi-backend: el mismo codigo funciona en TensorFlow, PyTorch y JAX sin modificaciones.
- Normalizacion integrada: acepta imagenes sin preprocesar en rango [0, 255].
- No soporta tool calling, agentes ni capacidades multimodales (es un modelo puramente visual).

## Casos de uso

- Clasificacion de imagenes en produccion: al ser un modelo ligero (~2M parametros), puede desplegarse en entornos con recursos limitados, como edge devices o funciones serverless, para tareas de clasificacion generica o fine-tuning en dominios especificos.
- Backbone para deteccion de objetos: las caracteristicas multiescala (strides 4, 8, 16, 32) lo hacen adecuado como extractor de features en arquitecturas tipo Faster R-CNN o YOLO, especialmente en proyectos que requieren portabilidad entre frameworks.
- Transfer learning en dominios medicos: su tamano reducido permite fine-tuning con datasets pequenos en tareas como clasificacion de radiografias o imagenes dermatologicas, donde los recursos computacionales son limitados.
- Prototipado rapido multiplataforma: al ser Keras 3, un equipo puede experimentar con el modelo en JAX y luego desplegarlo en TensorFlow sin reescribir codigo, acelerando el ciclo de desarrollo.
- Sistemas de busqueda visual: como extractor de embeddings, puede usarse para generar representaciones compactas de imagenes en motores de busqueda por similitud o sistemas de recomendacion visual.
- Educacion e investigacion: su implementacion limpia y documentada en Keras 3 lo convierte en una herramienta util para ensenar arquitecturas convolucionales o para investigar el diseno de espacios de redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda los pesos de `facebook/regnet-y-002`, cuyo rendimiento en ImageNet-1K puede consultarse en la model card original, pero no se proporcionan numeros concretos en esta conversion.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en FP32 (modelo de ~2M parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna (GTX 1050 Ti o superior).
- Opciones de despliegue: al ser Keras 3, puede servirse con TensorFlow Serving, TorchServe o mediante frameworks como FastAPI con el backend deseado. No hay soporte directo para vLLM, llama.cpp u Ollama (modelo de vision, no LLM).
- Latencia y throughput: no disponible, pero por su tamano se espera una latencia inferior a 10 ms por imagen en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zeromodels/regnet-y-002 | ~2M | 224x224 | Apache 2.0 | Keras 3 (TF/Torch/JAX) |
| facebook/regnet-y-002 | ~2M | 224x224 | Apache 2.0 | PyTorch (transformers) |
| timm/regnety_002.pycls_in1k | ~2M | 224x224 | Apache 2.0 | PyTorch (timm) |

Los tres modelos son el mismo checkpoint con diferentes empaquetados. La ventaja de la version zeromodels es la portabilidad entre backends; la de timm es su integracion con el ecosistema de PyTorch y utilidades de entrenamiento; la de facebook es la referencia original.

## Limitaciones y advertencias

- Modelo de vision: no procesa texto, audio ni otros modos.
- Resolucion fija: disenado para 224x224; usos con otras resoluciones requieren adaptacion.
- Sesgos de ImageNet: los pesos reflejan los sesgos del dataset original, que puede tener representacion desigual de ciertas categorias o regiones geograficas.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto).
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero se recomienda revisar los terminos del checkpoint original.
- Sin garantias de rendimiento: no se proporcionan benchmarks propios; el rendimiento real depende del caso de uso y del fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/regnet-y-002
- Coleccion RegNet de zeromodels: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b
- Paper original: https://arxiv.org/abs/2003.13678
- Paper en HF: https://huggingface.co/papers/2003.13678
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion RegNet: https://imvision12.github.io/ZeroModels/regnet/
- Model card original (facebook): https://huggingface.co/facebook/regnet-y-002
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
