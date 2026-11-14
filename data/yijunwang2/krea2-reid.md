# yijunwang2/krea2-reid

## Resumen

Krea 2 ReID Reference es un adaptador LoRA de rango 32 desarrollado por el usuario yijunwang2 para el modelo de difusion Krea 2 Turbo (krea/Krea-2-Turbo). Su funcion es la preservacion de identidad en generacion y edicion de imagenes: toma una unica imagen de referencia y permite que el prompt modifique vestuario, pose, composicion y fondo manteniendo los rasgos estables del sujeto. Funciona tanto con sujetos fotorealistas como ilustrados.

El adaptador se entrena contra Krea 2 Raw y esta disenado para inferencia destilada de 8 pasos con Krea 2 Turbo. A diferencia de un modelo de reconstruccion o de edicion general, no copia cada detalle de la imagen fuente: retiene caracteristicas de identidad sin replicar la escena original. El pipeline incluido es la referencia fijada ostris/Krea2OstrisEdit, y requiere dos rutas de condicionamiento simultaneas (embedding de imagen via Qwen3-VL y tokens VAE limpios de la referencia).

El repositorio ocupa 0,5 GB e incluye pesos LoRA en safetensors, pipeline en Python, un detector YuNet INT8 en ONNX para recorte facial opcional y un workflow oficial para ComfyUI con nodos personalizados de Ostris. La licencia es la Krea 2 Community License, distinta de las licencias open source habituales, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre modelo de difusion Krea 2 Turbo; pipeline image-to-image con condicionamiento dual (Qwen3-VL + VAE) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Krea 2 Turbo no declara parametros en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen); presupuesto de referencia de 384 x 384 pixeles |
| Tipos de cuantizacion | Pesos LoRA en safetensors; detector YuNet en ONNX INT8; cuantizacion del modelo base no disponible |
| Idiomas soportados | No disponible (modelo de imagen; prompts dependen del codificador de texto del modelo base) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) |
| Formato de pesos | safetensors (LoRA), ONNX (detector facial YuNet), JSON (workflow ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 acoplado al modelo de difusion Krea 2 Turbo. La inferencia combina dos rutas de condicionamiento: un embedding de imagen generado por Qwen3-VL que se inyecta en el prompt, y tokens VAE limpios de la imagen de referencia anadidos a traves del pipeline de edicion. El adaptador se entreno con atencion de referencia aislada, de modo que el cache de K/V de la referencia (kv_cache=True) forma parte del contrato del modelo: precalcula las K/V de la referencia una vez y las reutiliza en todos los pasos de denoising.

El entrenamiento se realizo contra Krea 2 Raw y el adaptador esta pensado para la inferencia destilada de 8 pasos de Krea 2 Turbo, con guidance scale 0.0 y escala de LoRA 1.0. No se detallan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. El pipeline de referencia es ostris/Krea2OstrisEdit, fijado en el repositorio, y el autor advierte que el snippet autogenerado de Diffusers y los flujos de LoRA de estilo convencionales no son compatibles con este adaptador funcional.

## Capacidades

- Preservacion de identidad a partir de una unica imagen de referencia RGB, con cambio libre de vestuario, pose, composicion, iluminacion y fondo mediante prompt.
- Soporte de sujetos fotorealistas, ilustrados y estilizados en 3D.
- Referencias de retrato cercano que guian salidas de tres cuartos y cuerpo completo, y referencias cuadradas que guian salidas verticales.
- El aspect ratio de salida es independiente del de la referencia.
- Inferencia destilada de 8 pasos con Krea 2 Turbo y cache de K/V de referencia.
- Recorte facial automatico opcional mediante detector YuNet INT8 (vista 320x320, umbral 0.35, seleccion de la cara de mayor confianza).
- Integracion con ComfyUI mediante workflow oficial con nodos personalizados de Ostris.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode (no aplicables a un modelo de imagen).

## Casos de uso

- Generacion de personajes consistentes en series de ilustracion: usar un retrato de referencia y variar prompt para producir al mismo personaje en escenarios, vestuarios y encuadres distintos, manteniendo rasgos faciales estables gracias al LoRA de identidad.
- Prototipado de vestuario y direccion de arte: partir de un retrato cercano del sujeto y generar variantes con cambios de ropa, iluminacion y localizacion, utiles para previsualizar estilismos sin sesion fotografica.
- Creacion de avatares y personajes para videojuegos o narrativa visual: el soporte de sujetos ilustrados y estilizados 3D permite mantener la identidad de un personaje entre ilustraciones y renders.
- Flujos de edicion por lotes en ComfyUI: el workflow oficial con cache de K/V habilitado permite procesar multiples prompts sobre la misma referencia con coste de precomputo amortizado.
- Generacion de material promocional con un modelo de persona sintetica: al usar referencias totalmente sinteticas se evita depender de la imagen de una persona real, reduciendo riesgos de derechos de imagen.
- Investigacion en preservacion de identidad: el adaptador sirve como referencia reproducible (pasos, semilla, escala) para comparar tecnicas de identity preservation en modelos de difusion destilados.
- Automatizacion de recorte de referencia: el helper face_crop.py con YuNet permite preparar referencias centradas en rostro de forma desatendida antes de pasarlas al pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta capacidades cualitativas probadas (fotorealismo, ilustracion, estilizado 3D, cambios sustanciales de vestuario, pose, encuadre, iluminacion y fondo) y las condiciones de generacion de los ejemplos (8 pasos, semillas fijas 17072026 a 17072032, sin descartes de candidatos).

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,5 GB; el consumo de VRAM depende del modelo base Krea 2 Turbo, cuyo requisito no se detalla en la informacion disponible.
- El adaptador en si es un LoRA de rango 32, por lo que su huella adicional sobre el modelo base es reducida en comparacion con un fine-tuning completo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la precision usada en ComfyUI.
- Despliegue: pipeline Python propio (pipeline.py y example.py incluidos), ComfyUI con nodos personalizados de Ostris y cache de K/V de referencia habilitado. El snippet autogenerado de Diffusers no es compatible.
- Latencia y throughput: no disponibles; la inferencia usa 8 pasos de denoising con guidance 0.0, lo que reduce el coste frente a configuraciones no destiladas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / referencia | Licencia | Notas |
|---|---|---|---|---|---|
| Krea 2 ReID Reference | LoRA rango 32 sobre Krea 2 Turbo | No disponible | Referencia de 384 x 384 px | Krea 2 Community License | Preservacion de identidad con cambio libre de escena |
| ostris/Krea2OstrisEdit | Pipeline de referencia para Krea 2 | No disponible | No disponible | No disponible | Pipeline base sobre el que se apoya este adaptador |
| krea/Krea-2-Turbo | Modelo de difusion base destilado | No disponible | No disponible | Krea 2 Community License | Modelo sobre el que se aplica el LoRA |

No se dispone de datos de benchmarks ni de especificaciones de parametros de los modelos comparados en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El snippet autogenerado de Diffusers y los flujos de LoRA de estilo no funcionan con este adaptador; es obligatorio usar el pipeline incluido o el workflow oficial de ComfyUI con los nodos de Ostris.
- El cache de K/V de referencia (kv_cache=True) es parte del contrato del modelo; desactivarlo altera el comportamiento esperado.
- El adaptador prioriza identidad sobre fidelidad: no reconstruye la imagen fuente ni copia todos sus detalles, lo que puede no ser adecuado para tareas de edicion precisa.
- Una referencia de cuerpo completo tiende a preservar mas el vestuario y la pose, reduciendo la libertad del prompt; se recomienda recorte de rostro y parte superior del cuerpo.
- Riesgo de alucinacion visual y de deriva de identidad en cambios extremos de encuadre o estilo no cubiertos por los casos probados.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de imagen, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Licencia Krea 2 Community License: no es una licencia open source estandar; es necesario revisar las condiciones en krea.ai/krea-2-licensing antes de cualquier uso comercial.
- El detector YuNet es opcional y no forma parte del LoRA; su inclusion no implica que el pipeline lo requiera.
- Los ejemplos de la model card son imagenes totalmente sinteticas y no representan a personas reales; no deben interpretarse como evidencia de rendimiento sobre sujetos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yijunwang2/krea2-reid
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Pipeline de referencia: https://huggingface.co/ostris/Krea2OstrisEdit
- Licencia Krea 2: https://krea.ai/krea-2-licensing
