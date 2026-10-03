# Zstan123/flux-3-action-base

## Resumen

FLUX 3 Action Base es un componente de adaptacion de pesos abiertos publicado dentro de la familia FLUX 3 Action, un "world action model" de 7B orientado a robotica. El modelo toma fotogramas de camara, el estado del robot y una instruccion en lenguaje natural, y devuelve el siguiente bloque de acciones motoras, denoised conjuntamente con los siguientes fotogramas de video. Es decir, combina prediccion de acciones con prediccion de video dentro del mismo proceso generativo.

Este repositorio concreto ("action base") no es una politica de robot completa, sino la base de adaptacion de embodiment junto con los encoders congelados compartidos que usan las politicas SO-101 y DROID. Incluye el trunk de acciones compartido y las cabezas de accion ee50/gaming, de modo que cada nuevo embodiment o simulador necesita entrenar sus propias cabezas de accion. Su relevancia actual radica en que expone pesos abiertos para adaptar un world action model multimodal a brazos roboticos nuevos, algo poco habitual en el ecosistema de modelos de accion.

La ficha se construye a partir de la model card y de los metadatos de HuggingFace facilitados. Conviene notar que el identificador del repositorio consultado es Zstan123/flux-3-action-base (0 descargas, 0 likes), mientras que la propia model card y todos los enlaces internos apuntan al repositorio black-forest-labs/flux-3-action-base. Se recomienda verificar la procedencia antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World action model generativo basado en FLUX 3; flujo de video y flujo de texto, trunk de acciones compartido y cabezas de accion (ee50/gaming). VAE de video compartido y text encoder Qwen3-VL-4B-Instruct. 457 tensores |
| Parametros totales | 7B (modelo FLUX 3 Action); el repositorio es un componente de adaptacion, no la politica completa |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (las instrucciones se procesan via Qwen3-VL-4B-Instruct, pero no se documenta cobertura linguistica) |
| Licencia | FLUX Kommunity License v.1.0 (flux-kommunity-license); el text encoder Qwen3-VL-4B-Instruct es una copia sin modificar bajo Apache-2.0 |
| Formato de pesos | safetensors (flux-3-action-base.safetensors, video_vae.safetensors, text_encoder/) |

## Arquitectura y entrenamiento

FLUX 3 Action es un world action model multimodal que integra tres piezas: un VAE de video compartido, un text encoder (Qwen3-VL-4B-Instruct) y un trunk de acciones con cabezas especificas por embodiment. La generacion de acciones no se plantea como una regresion directa, sino como un proceso de denoising acoplado con la prediccion del siguiente bloque de fotogramas de video. El repositorio contiene 457 tensores distribuidos entre el flujo de video, el flujo de texto, el trunk de acciones compartido y las cabezas ee50/gaming. La model card indica que los nuevos embodiments requieren sus propias cabezas de accion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal. El text encoder se distribuye como copia sin modificar de Qwen/Qwen3-VL-4B-Instruct, conservando su model card y licencia Apache-2.0 en text_encoder/README.md. La model card referencia el repositorio de codigo de entrenamiento e inferencia black-forest-labs/flux-action.

## Capacidades

- Prediccion de acciones roboticas: dado un conjunto de fotogramas de camara, el estado del robot y una instruccion de texto, devuelve el siguiente bloque de acciones (joint targets).
- Prediccion de video: los fotogramas siguientes se generan denoised junto con las acciones, lo que permite anticipar la escena resultante de la accion.
- Adaptacion de embodiment: sirve como base para entrenar cabezas de accion para nuevos robots, simuladores o videojuegos.
- Integracion con politicas listas para usar: las configuraciones de SO-101 y DROID referencian automaticamente estos encoders compartidos.
- Comprension de instrucciones en lenguaje natural via el text encoder Qwen3-VL-4B-Instruct.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: generacion de acciones motoras y prediccion de video; no se documentan modos de "thinking", audio ni vision mas alla del uso de camara como entrada.

## Casos de uso

- Adaptacion a un brazo robotico nuevo: se parte de esta base, se conservan los encoders congelados compartidos (VAE de video y text encoder) y se entrena una cabeza de accion especifica para el nuevo embodiment, siguiendo la guia de fine-tuning indicada en la model card.
- Desarrollo de politicas manipulativas en simulador: el modelo permite entrenar cabezas de accion para un simulador y evaluar la politica sin riesgo fisico antes de trasladarla a hardware real.
- Base para politicas SO-101: este repositorio proporciona los encoders y la base que las configuraciones de la politica SO-101 referencian automaticamente, de modo que actua como dependencia directa de ese despliegue.
- Base para politicas DROID: de forma analoga, la politica DROID referencia estos encoders compartidos, por lo que el repositorio es la pieza de adaptacion previa a su uso.
- Investigacion en world action models: permite estudiar la generacion conjunta de acciones y video (denoising acoplado) midiendo la coherencia entre la accion prevista y los fotogramas predichos.
- Experimentacion con juegos o entornos de gaming: la presencia de cabezas de tipo gaming sugiere su uso para mapear entradas de camara y estado a secuencias de accion en videojuegos o entornos interactivos.
- Control de robot con supervision humana: en escenarios de investigacion con un operador presente y un medio de parada al alcance, el modelo genera objetivos articulares que la aplicacion debe limitar en velocidad, fuerza y espacio de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 25,4 GB, lo que incluye los pesos base, el VAE de video y el text encoder Qwen3-VL-4B-Instruct. Es una cifra de almacenamiento, no de VRAM.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa y no confirmada, los 7B del modelo en precision completa rondarian los 14 GB, a lo que habria que sumar el text encoder (4B) y el VAE de video; en precision reducida el consumo baja de forma proporcional. Estas cifras son estimaciones por tamano y no estan verificadas por el autor.
- GPU recomendadas: no disponibles. Dado el volumen de pesos y el componente de video, un uso comodo apuntaria a GPUs de datacenter (A100, H100) o GPUs de gama alta con amplia VRAM.
- Encaje en GPU de consumo: no confirmado. El tamano total del repositorio hace improbable un encaje comodo en GPUs de consumo sin cuantizacion, de la que no se documentan variantes.
- Opciones de despliegue: la libreria asociada es lerobot (pipeline robotics). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el codigo de inferencia se distribuye en black-forest-labs/flux-action.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos externos comparables en la informacion proporcionada, por lo que la comparacion con alternativas de terceros queda como no disponible. Dentro de la propia familia FLUX 3 Action, la model card distingue las siguientes piezas:

| Componente | Rol | Estado |
|---|---|---|
| flux-3-action-base (este repositorio) | Base de adaptacion de embodiment + encoders congelados; no es una politica completa | Adaptacion |
| flux-3-action-so101 | Politica de robot lista para usar | Referencia a los encoders compartidos |
| flux-3-action-droid | Politica de robot lista para usar | Referencia a los encoders compartidos |

## Limitaciones y advertencias

- No es una politica de robot completa: es un componente de adaptacion. Los nuevos embodiments requieren entrenar sus propias cabezas de accion.
- Seguridad fisica: el modelo emite objetivos articulares (joint targets) y no acota velocidad, fuerza ni espacio de trabajo. La aplicacion debe imponer esos limites y disponer de una parada de hardware al alcance.
- Validacion previa obligatoria: se debe validar en simulador o con los limites de seguridad del brazo activados antes de operar cerca de personas.
- Procedencia del repositorio: el identificador consultado es Zstan123/flux-3-action-base (0 descargas, 0 likes), mientras que la model card y sus enlaces apuntan a black-forest-labs/flux-3-action-base. Conviene verificar la autenticidad y el estado del repositorio antes de usarlo en produccion.
- Usos fuera de alcance recogidos en la model card: no usar de forma que vulnere la ley; no controlar maquinas que pongan en peligro a personas sin supervision humana y medio de parada; no usar para decision automatizada de alto riesgo que afecte a derechos legales u obligaciones vinculantes; no usar para acoso, amenazas o acecho; no usar para explotar o danar a menores.
- Licencia: FLUX Kommunity License v.1.0. Es una licencia "other" (no Apache ni MIT), por lo que se deben revisar las condiciones para uso comercial antes de desplegar. El text encoder Qwen3-VL-4B-Instruct es Apache-2.0, con su propia designacion en text_encoder/README.md.
- Idiomas: no se documenta cobertura linguistica, a pesar de que las instrucciones se procesen con Qwen3-VL-4B-Instruct.
- Alucinacion: no se documenta comportamiento especifico, pero al generar acciones y video de forma conjunta existe riesgo de predicciones no fieles a la escena real; se debe monitorizar.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar fiabilidad, sesgos o rendimiento comparado.

## Enlaces

- HuggingFace del repositorio consultado: https://huggingface.co/Zstan123/flux-3-action-base
- HuggingFace del repositorio referenciado en la model card: https://huggingface.co/black-forest-labs/flux-3-action-base
- Coleccion FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Documentacion de FLUX 3 Action: https://docs.bfl.ai/flux_3/flux3_action_overview
- Guia de fine-tuning: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Codigo de entrenamiento e inferencia: https://github.com/black-forest-labs/flux-action
- Politica SO-101: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Politica DROID: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Text encoder Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Blog de desarrollo responsable: https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse
- Contacto de seguridad: safety@blackforestlabs.ai
