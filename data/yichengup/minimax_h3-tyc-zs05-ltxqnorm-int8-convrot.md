# yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot

## Resumen

Este repositorio contiene un checkpoint de un solo archivo para ComfyUI derivado de los pesos oficiales de MiniMax H3, un modelo de generación de vídeo a partir de imagen con audio asociado (image-to-video y audio-video). Lo publica el usuario `yichengup` y no se trata de un modelo entrenado desde cero, sino de una modificación quirúrgica de los pesos BF16 oficiales de `Comfy-Org/MiniMax-H3`, a la que se han injertado perfiles de magnitud de atención procedentes de dos modelos donantes (Z-Image-Turbo y LTX-2.5) y que después se ha cuantizado una única vez a int8.

La relevancia de esta ficha es acotada: es un artefacto de experimentación comunitaria, con cero descargas y cero likes en el momento de la consulta, orientado a usuarios avanzados de ComfyUI que quieran probar variantes de atención sobre H3 sin instalar nodos personalizados. El autor declara explícitamente que solo los tensores `attn.q_norm` por cabeza llevan los injertos; el resto de tensores son el release oficial salvo el redondeo a int8.

El tamaño del repositorio es de 21,0 GB, la licencia es la MiniMax H3 Community License y la librería declarada es `minimax-h3`. No se especifican parámetros totales, longitud de contexto ni idiomas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para image-to-video y audio-video; detalles internos no publicados en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 tensorwise con convrot (cuantización única al final del proceso); pesos base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (los donantes: Z-Image Apache-2.0, LTX-2.5 bajo LTX-2.x Community License) |
| Formato de pesos | checkpoint de un solo archivo para ComfyUI con metadatos `comfy_quant`; tamaño de repo 21,0 GB |
| SHA256 | `708da592289758016e3350be144937577aaeceea423e9769c3fd41617a00251f` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de MiniMax H3 en la documentación proporcionada (número de parámetros, tipo de backbone, mecanismo de atención o componentes de audio). Lo que sí está documentado es el procedimiento de construcción de este checkpoint: se parte de los pesos BF16 oficiales podados de `Comfy-Org/MiniMax-H3` y se aplican injertos de magnitud de atención ("attention-magnitude grafts") procedentes de `Tongyi-MAI/Z-Image-Turbo` y `Lightricks/LTX-2.5`. Según el autor, únicamente los perfiles de magnitud de `attn.q_norm` por cabeza contienen los injertos; todos los demás tensores permanecen idénticos al release oficial, salvo el redondeo a int8.

El autor subraya que no se usó ningún checkpoint híbrido de terceros como fuente: cada cambio se aplicó sobre los pesos BF16 oficiales y la cuantización se realizó una sola vez al final. El resultado es un archivo int8 tensorwise con convrot que ComfyUI carga directamente mediante el nodo estándar "Load Diffusion Model" (ComfyUI 0.32 o superior), sin necesidad de nodos de cuantización personalizados, ya que el archivo incluye metadatos `comfy_quant`. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, porque no se trata de un modelo entrenado sino de una modificación de pesos.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con audio asociado, según el pipeline declarado (`image-to-video`) y la etiqueta `audio-video`.
- Generación de tomas únicas de hasta 12 segundos: el prompt de demostración corresponde a una toma única de 12 s en modo Ref2VA.
- Compatibilidad con LoRAs de aceleración de 4 pasos (`minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16`), lo que permite reducir el número de pasos de muestreo.
- Compatibilidad con LoRAs de movimiento e impacto (`Impact_Flow_v2_H3_rank16`, `H3_Combat_V2`) orientadas a escenas de combate y acción.
- Carga nativa en ComfyUI sin nodos adicionales gracias a los metadatos de cuantización embebidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual; el modelo es generativo visual, no un LLM.

## Casos de uso

- Prototipado rápido de vídeo a partir de imagen en ComfyUI: al cargarse con el nodo estándar "Load Diffusion Model" y no requerir nodos de cuantización, permite iterar sobre un flujo image-to-video en una instalación limpia de ComfyUI 0.32 o superior.
- Evaluación de variantes de atención sobre H3: investigadores que quieran medir el efecto de los injertos de magnitud en `attn.q_norm` pueden comparar este checkpoint con el release oficial BF16 manteniendo el resto de tensores idénticos, lo que aísla la variable experimental.
- Generación de clips cortos con audio para previsualización de guion: la ventana de 12 s en una sola toma y el pipeline audio-video permiten producir borradores de escena con sonido antes de un render final de mayor calidad.
- Escenas de acción y combate: combinado con las LoRAs `Impact_Flow_v2_H3_rank16` o `H3_Combat_V2`, el checkpoint está pensado para generar movimiento de impacto y coreografías de espada en pruebas de concepto.
- Reducción de coste de inferencia en pruebas: al estar cuantizado a int8 y admitir la LoRA turbo de 4 pasos, sirve para validar prompts y composiciones con menos recursos que el modelo BF16 completo antes de escalar a producción.
- Ejecución en la nube sin instalación local: el autor ofrece flujos listos para ejecutar en RunningHub (internacional y China), útil para demos o para equipos sin GPU adecuada.
- Integración en pipelines de ComfyUI existentes: al compartir el text encoder y los VAE estándar de H3, puede sustituir al checkpoint base en un grafo ya montado sin reconfigurar el resto de nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 21,0 GB en int8, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más el overhead del text encoder, los VAE y las activaciones durante el muestreo.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, no es probable que quepa en GPUs de consumo con 8-16 GB; se requerirían aceleradores con 24 GB o más, aunque el autor no lo confirma.
- ¿Cabe en GPU de consumo? No confirmado. Con 21 GB de pesos en int8, solo GPUs con 24 GB o más (por ejemplo, RTX 4090) podrían albergarlo, y aun así con margen ajustado para activaciones y componentes auxiliares.
- Opciones de despliegue: ComfyUI 0.32 o superior mediante el nodo "Load Diffusion Model"; ejecución en la nube vía RunningHub (internacional y China). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor referencia una LoRA de aceleración de 4 pasos que reduciría el coste de muestreo, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot`) | Image-to-video / audio-video, int8 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas |
| `Comfy-Org/MiniMax-H3` (base oficial) | Image-to-video / audio-video, BF16 podado | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (modelo base declarado) |
| `Tongyi-MAI/Z-Image-Turbo` (donante) | Generación de imagen | no disponible | no disponible | Apache-2.0 | Hugging Face |
| `Lightricks/LTX-2.5` (donante) | Generación de vídeo | no disponible | no disponible | LTX-2.x Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a procedencia, licencia y formato.

## Limitaciones y advertencias

- Artefacto experimental sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. No hay evidencia independiente de que los injertos de atención mejoren el resultado frente al H3 oficial.
- Naturaleza del cambio: solo se modifican los perfiles de magnitud de `attn.q_norm` por cabeza; cualquier diferencia de comportamiento frente al base es atribuible a ese cambio más el redondeo a int8, cuyo impacto cualitativo no se documenta con métricas.
- Riesgo de alucinación visual y artefactos: como todo modelo generativo de vídeo, puede producir inconsistencias temporales, deformaciones anatómicas y desincronización entre audio y vídeo; no se han publicado tasas de fallo.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License, que prohíbe generar imágenes de personas reales sin consentimiento, contenido ilegal y cualquier uso vetado por las licencias upstream. El uso comercial debe verificarse contra el texto de `LICENSE` y `NOTICE` del repositorio.
- Licencias de los donantes: Z-Image es Apache-2.0 (permisiva), pero LTX-2.5 está bajo la LTX-2.x Community License, con posibles condiciones adicionales que afectan al uso del modelo derivado.
- Idiomas: no se declara soporte multilingüe; los prompts del flujo de demostración están en inglés y no hay información sobre comportamiento con prompts en castellano.
- Dependencia de terceros: las LoRAs recomendadas (turbo de 4 pasos, Impact Flow v2, H3 Combat V2) no se redistribuyen en este repositorio y deben descargarse por separado, con sus propias licencias.
- Requisitos de software: necesita ComfyUI 0.32 o superior; versiones anteriores no leerán correctamente los metadatos `comfy_quant`.
- Verificación de integridad: conviene comprobar el SHA256 `708da592289758016e3350be144937577aaeceea423e9769c3fd41617a00251f` tras la descarga, dado que el archivo es un binario de 21 GB de un autor sin historial público verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Detalles técnicos (DETAILS.md): https://huggingface.co/yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot/blob/main/DETAILS.md
- Prompt de demostración: https://huggingface.co/yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot/blob/main/demo-prompt.txt
- Vídeo de demostración: https://huggingface.co/yichengup/minimax_h3-tyc-zs05-ltxqnorm-int8-convrot/resolve/main/demo.mp4
- LoRA de aceleración (RunningHubAI): https://huggingface.co/RunningHubAI/rh-minimax-h3-ref2v-turbo-4step-v0.1-comfyui-bf16.safetensors-lora
- LoRA Impact Flow v2 (autor): https://huggingface.co/yichengup/Impact-Flow-v2
- LoRA H3 Combat V2 (JOKER141): https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2
- Ejecución en RunningHub (internacional): https://www.runninghub.ai/post/2120030695909658626/?inviteCode=rh-v1091
- Ejecución en RunningHub (China): https://www.runninghub.cn/post/2120017578927149057/?inviteCode=cn-v1079
