# wrchen1/LatentMT-2.6B-eng-latn-taq-latn

## Resumen

LatentMT-2.6B-eng-latn-taq-latn es un adaptador LoRA para traducción automática del par inglés (eng_Latn) a taq (taq_Latn), desarrollado por Wei-Rui Chen y colaboradores en el marco del paper "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.600 millones de parámetros publicado bajo licencia Apache 2.0.

La propuesta principal de LatentMT es el uso de razonamiento latente: en lugar de generar cadenas de pensamiento explícitas (tokens de CoT), el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos, lo que permite mejorar la calidad de la traducción sin aumentar el número de tokens generados. Este adaptador concreto corresponde a la configuración entrenada con profundidad recurrente 4 para el par indicado.

El repositorio contiene únicamente los archivos del adaptador (adapter_config.json, adapter_model.safetensors y README.md), con un tamaño total de 0,1 GB. Está pensado para uso en investigación y su licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo de lenguaje causal) |
| Parametros totales | no disponible (el adaptador LoRA tiene un tamano de 0,1 GB; el modelo base tiene 2.600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cargarse con torch_dtype="auto") |
| Idiomas soportados | ingles (eng_Latn) como origen y taq (taq_Latn) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.600 millones de parametros. La innovacion principal de LatentMT es el razonamiento latente: se introducen pasos recurrentes adicionales dentro de los estados ocultos del modelo, de modo que el modelo "piensa" internamente antes de producir la traduccion, sin generar tokens de cadena de pensamiento visibles. En este adaptador concreto, la profundidad recurrente es 4.

El entrenamiento se describe como ligero (lightweight training) en el paper, aunque no se especifican los datos exactos, el numero de tokens ni el procedimiento de optimizacion (si se uso RLHF, DPO u otro). El adaptador se distribuye en formato PEFT (LoRA) y se carga con la libreria `peft` junto con el modelo base. Los requisitos de entorno indicados son torch 2.7.1, transformers 4.56.2, datasets>=2.14.0, peft>=0.10.0 y bitsandbytes>=0.41.0.

## Capacidades

- Traduccion automatica del par ingles (eng_Latn) a taq (taq_Latn), con calidad comparable a modelos de 3 a 5 veces mas grandes segun el paper.
- Razonamiento latente: realiza pasos recurrentes internos en los estados ocultos, lo que mejora la traduccion sin generar tokens adicionales de razonamiento.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Traduccion de textos largos: el razonamiento latente permite mantener coherencia en documentos extensos sin aumentar el coste de generacion, adecuado para traducir informes, articulos o manuales.
- Localizacion de software: puede integrarse en pipelines de traduccion de cadenas de interfaz, donde la eficiencia y la calidad son criticas.
- Traduccion de contenido web: util para traducir paginas o blogs de ingles a taq, aprovechando el modelo base de 2.6B que puede ejecutarse en hardware moderado.
- Investigacion en traduccion automatica: sirve como punto de partida para estudiar el impacto del razonamiento latente en pares de idiomas de bajos recursos.
- Prototipado rapido: al ser un adaptador LoRA, se puede cargar y probar en pocos minutos con el codigo de ejemplo proporcionado, ideal para experimentos academicos.
- Traduccion asistida en entornos con restricciones de VRAM: al usar un modelo base de 2.6B, es viable en GPUs de consumo medio, a diferencia de modelos mucho mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el par eng_Latn-taq_Latn en la informacion disponible. El paper LatentMT reporta que, en 32 direcciones de traduccion que abarcan idiomas de alta, media y baja disponibilidad de recursos, el modelo alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes, pero no se desglosan cifras concretas para este par concreto.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,1 GB), pero el modelo base Ouro-2.6B-Thinking requiere recursos tipicos para un modelo de 2.600 millones de parametros.
- En precision FP16, el modelo base ocupa aproximadamente 5,2 GB de VRAM, mas el overhead de activaciones y el adaptador. Con cuantizacion de 4 bits (bitsandbytes), podria caber en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060.
- Para inferencia con el codigo de ejemplo, se recomienda al menos una GPU con 8 GB de VRAM si se usa cuantizacion, o 12-16 GB para FP16 sin cuantizar.
- Opciones de despliegue: el codigo de carga usa `transformers` y `peft`, por lo que es compatible con vLLM, TGI u Ollama si se convierte el adaptador a un formato unificado, aunque no se documenta explicitamente.
- La latencia dependera del hardware y de la profundidad recurrente (4 pasos internos), que anade un coste computacional adicional frente a un modelo sin razonamiento latente.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para el par eng_Latn-taq_Latn. El paper menciona que el rendimiento es comparable a modelos de 3 a 5 veces mas grandes, pero no se citan nombres concretos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta pensado exclusivamente para investigacion en traduccion automatica; no se garantiza su idoneidad para produccion.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos web, puede reflejar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido, especialmente en contextos ambiguos.
- Limitacion de idioma: solo cubre el par ingles-taq; no es multilingue ni admite otros pares sin entrenamiento adicional.
- La longitud de contexto no se especifica, por lo que no se conoce el limite de tokens de entrada/salida.
- El adaptador depende del modelo base Ouro-2.6B-Thinking; si este cambia o deja de estar disponible, el adaptador podria no funcionar correctamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y del paper antes de un despliegue productivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-taq-latn
- Paper en arXiv: https://arxiv.org/abs/2607.18618 (PDF: https://arxiv.org/pdf/2607.18618)
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio alternativo del adaptador (misma organizacion): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-taq-latn
