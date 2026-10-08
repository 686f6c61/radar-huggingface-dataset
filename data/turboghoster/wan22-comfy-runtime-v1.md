# TurboGhoster/WAN22-COMFY-RUNTIME-V1

## Resumen

TurboGhoster/WAN22-COMFY-RUNTIME-V1 es un repositorio de Hugging Face publicado por el usuario TurboGhoster que no contiene ningún modelo entrenado, sino una reserva de espacio ("model bundle reservation") gobernada por el sistema GhostStack. El autor declara explícitamente que el repositorio no es oficial de Comfy-Org y que el intento de fabricación del bundle queda bloqueado antes de mover ningún peso: las superficies actuales de creación de pods CPU de RunPod rechazan el disco efímero de contenedor de 120 GB que el runtime exige. Como consecuencia, no hay payload de modelo presente ni aceptado, y el repositorio no es utilizable para inferencia.

El objetivo declarado de esa reserva es el runtime congelado de Wan 2.2 en su variante image-to-video (I2V) con condicionamiento de primer y último fotograma, integrado en ComfyUI. Wan 2.2 es un modelo de difusión de vídeo de código abierto que la comunidad ejecuta dentro de ComfyUI y que se distribuye en variantes de 14B para text-to-video e image-to-video (con checkpoints diferenciados de alto y bajo ruido) junto a un modelo híbrido de 5B para texto-imagen-vídeo.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y su actualización (2026-10-08) es apenas dos minutos posterior a la creación. Su interés es exclusivamente como marcador de infraestructura: quien necesite pesos funcionales de Wan 2.2 debe acudir al repositorio de empaquetado de Comfy-Org, no a esta reserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio. El runtime objetivo declarado es Wan 2.2 I2V first+last frame (modelo de difusion de video). |
| Parametros totales | No disponible. Las variantes upstream de Wan 2.2 I2V se distribuyen como 14B (checkpoints de alto y bajo ruido, fp8_scaled) y el modelo hibrido TI2V como 5B, segun los resultados de busqueda. |
| Parametros activos | No aplica / no disponible. |
| Longitud de contexto | No aplica (modelo generativo de video). No disponible. |
| Tipos de cuantizacion | No disponible en el repositorio. El ecosistema Wan 2.2 en ComfyUI emplea checkpoints fp8_scaled. |
| Idiomas soportados | No disponible (no declarado). |
| Licencia | No disponible (el repositorio no declara licencia). |
| Formato de pesos | No hay pesos. El formato habitual de los bundles de ComfyUI es safetensors; no confirmado para este repositorio. |

## Arquitectura y entrenamiento

Este repositorio no contiene arquitectura propia ni proceso de entrenamiento: es una reserva de bundle gobernada por GhostStack para un runtime congelado. La model card no documenta arquitectura, dataset, número de tokens, fases de RLHF/DPO ni innovaciones técnicas del modelo objetivo. Toda la información técnica disponible se limita a la descripción del runtime destino (Wan 2.2 I2V first+last frame) y a la causa del bloqueo: la creación de pods CPU en RunPod rechaza el disco efímero de 120 GB requerido.

La arquitectura subyacente a la que apunta el bundle pertenece a la familia Wan 2.2, un modelo de difusión de vídeo que en el ecosistema ComfyUI se sirve mediante checkpoints safetensors cuantizados a fp8_scaled. Los resultados de búsqueda confirman la existencia de los ficheros upstream (`wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors`) y de flujos nativos para texto-a-vídeo, imagen-a-vídeo y primer-último fotograma, pero no aportan detalles de entrenamiento. No se dispone de información verificable sobre la composición del dataset ni sobre el pipeline de alineación de Wan 2.2 en el material proporcionado.

## Capacidades

Debe subrayarse que, al no existir payload en este repositorio, ninguna de las capacidades siguientes es ejecutable a través de él. Se listan como capacidades del runtime objetivo declarado:

- Generación de vídeo a partir de una imagen con condicionamiento por primer y último fotograma (I2V first+last frame), que permite fijar el estado inicial y final de una secuencia.
- Integración en ComfyUI mediante grafos de nodos, con flujos nativos documentados para texto-a-vídeo, imagen-a-vídeo y primer-último fotograma.
- Ejecución en GPU de consumo: los tutoriales citados describen despliegues funcionales de Wan 2.2 en ComfyUI con 8 GB de VRAM.
- Variantes de 14B para text-to-video e image-to-video (con checkpoints de alto y bajo ruido) y modelo híbrido de 5B TI2V, según los resultados de búsqueda.
- Soporte de tool calling / function calling: no disponible y no aplicable a un modelo de difusión de vídeo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada, salvo el condicionamiento por imagen propio del pipeline I2V.

## Casos de uso

Los casos siguientes describen aplicaciones del runtime Wan 2.2 I2V first+last frame que esta reserva pretende empaquetar. Quedan supeditados a que exista un payload utilizable, lo cual no ocurre en este repositorio.

- Interpolación de fotogramas clave en animación: dados un fotograma inicial y otro final dibujados por el animador, el modelo genera la secuencia intermedia, reduciendo el trabajo de inbetweening manual en producciones 2D.
- Previz y storyboard animado: convertir viñetas estáticas con encuadre inicial y final definidos en clips de referencia para validar ritmo, cámara y continuidad antes de rodar.
- Transiciones en postproducción: generar transiciones continuas entre dos planos cuando no existe metraje intermedio, usando el último fotograma de un plano y el primero del siguiente como anclas.
- Publicidad y contenido para redes: producir clips cortos a partir de una fotografía de producto fijando el encuadre final deseado, útil para variantes creativas a escala.
- Foto a vídeo corto (revitalización de imágenes fijas): animar material fotográfico de archivo con control del punto de llegada, por ejemplo para piezas conmemorativas o fondos de escenario.
- Prototipado de VFX y fondos animados: generar plates de referencia con movimiento controlado para previsualizar composiciones antes de invertir en renderizado 3D.
- Automatización de pipelines en ComfyUI sobre GPU de consumo: encadenar nodos de generación de vídeo en estaciones con 8 GB de VRAM según los flujos documentados, siempre que el bundle estuviese publicado.
- Reserva de infraestructura reproducible: el propio repositorio sirve como marcador para equipos que quieran provisionar un runtime congelado, aunque en su estado actual el aprovisionamiento falla por el requisito de 120 GB de disco efímero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas, y los resultados de búsqueda consultados describen flujos de instalación y ejecución en ComfyUI, pero no reportan valores de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo (FVD, CLIPSim u otras).

## Requisitos de hardware

- Almacenamiento: el runtime objetivo exige un disco efímero de contenedor de 120 GB, requisito que provoca el bloqueo del aprovisionamiento en pods CPU de RunPod.
- VRAM para inferencia: los tutoriales citados reportan ejecuciones de Wan 2.2 en ComfyUI con 8 GB de VRAM mediante flujos optimizados y checkpoints cuantizados. No hay cifra confirmada para este bundle concreto.
- GPUs recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: sí según los flujos documentados (8 GB de VRAM), condicionado a la disponibilidad de los pesos upstream.
- Opciones de despliegue: ComfyUI (interfaz de nodos). RunPod es el entorno de ejecución mencionado por el autor, actualmente bloqueado. vLLM y TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Recurso | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TurboGhoster/WAN22-COMFY-RUNTIME-V1 | No disponible (sin pesos) | No aplica | No declarada | 0 descargas, 0 likes, payload ausente, fabricacion bloqueada |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B en I2V (alto y bajo ruido, fp8_scaled) y 5B en TI2V | No disponible | No disponible en la informacion | Pesos safetensors publicados (`wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors`) |
| xiaomansynth/ComfyUI-wan22 | No disponible | No disponible | No disponible en la informacion | Repositorio de codigo de ComfyUI, no pesos |

No se dispone de datos de rendimiento comparado (calidad de vídeo, coherencia temporal o fidelidad al fotograma final) para ninguno de los recursos, por lo que la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni código ejecutable: es una reserva vacía. No puede utilizarse para inferencia.
- No es un repositorio oficial de Comfy-Org, según declara el propio autor.
- El aprovisionamiento está bloqueado por un requisito de disco efímero de 120 GB incompatible con las superficies de pods CPU de RunPod, lo que impide la fabricación del bundle.
- No se declara licencia, por lo que no existen derechos de uso comercial claros ni condiciones de redistribución.
- Sin descargas ni likes: no hay validación comunitaria ni evidencia de funcionamiento por parte de terceros.
- Fechas de creación y actualización atípicas (2026-10-08, con dos minutos de diferencia), sin historial de versiones.
- Ausencia total de documentación técnica: no hay arquitectura, dataset, métricas ni guía de uso verificables.
- Los repositorios de reserva sin contenido pueden confundirse con artefactos legítimos; conviene verificar siempre el origen antes de integrarlos en producción.
- Los casos de uso y requisitos de hardware aquí descritos corresponden al runtime objetivo declarado (Wan 2.2 I2V en ComfyUI), no a este repositorio, y dependen de los pesos upstream mantenidos por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TurboGhoster/WAN22-COMFY-RUNTIME-V1
- Pesos de referencia de Wan 2.2 empaquetados para ComfyUI: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/blob/main/split_files/diffusion_models/wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors
- Repositorio de ComfyUI para Wan 2.2: https://github.com/xiaomansynth/ComfyUI-wan22
- Flujo nativo oficial de Wan 2.2 en ComfyUI: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Tutorial de ejecucion de Wan 2.2 con 8 GB de VRAM (dev.to): https://dev.to/aitechtutorials/run-wan-22-in-comfyui-with-just-8gb-vram-full-image-to-video-ai-workflow-2gb6
- Guia de ejecucion de Wan 2.2 en ComfyUI (vocal.media): https://vocal.media/futurism/how-to-run-wan-2-2-in-comfy-ui-full-ai-video-workflow-works-on-8-gb-vram-ga4co0i3s
