# YJAYJA/ToucheWorld

## Resumen

ToucheWorld es un conjunto de adaptadores LoRA para generación de vídeo egocéntrico condicionado por manos, construido sobre el modelo base Lightricks/LTX-2.5 y el adaptador de cámara SolarWM LTX-22B. Lo desarrolla el usuario YJAYJA y se publica en HuggingFace como pesos complementarios, no como un checkpoint completo: el repositorio no incluye los pesos del modelo base ni del adaptador de cámara, que deben obtenerse por separado.

El modelo aborda un problema específico de los world models egocéntricos: la coherencia entre el movimiento de las manos del sujeto y la evolución del entorno visual generado. Para ello combina una LoRA de manos con un sidecar de acondicionamiento (un pequeño codificador de condicionamiento, no una LoRA) y, en la variante causal, una LoRA de destilación que habilita muestreo autorregresivo por bloques.

Se publican dos variantes: Teacher-27, orientada a image-to-video de primer fotograma con 153 frames a 24 fps, y Causal-27, que añade destilación causal para generación por bloques con ventana 8 y bloque 4. El repositorio ocupa 1,0 GB y la licencia es la LTX-2.x Community License Agreement, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer de difusión de vídeo (LTX-2.5) con adaptador de cámara SolarWM |
| Parámetros totales | no disponible (solo se publican adaptadores; el modelo base no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (153 frames a 24 fps en el protocolo Teacher-27, equivalente a ~6,4 s de vídeo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | safetensors (LoRA y sidecar) |

## Arquitectura y entrenamiento

ToucheWorld no es un modelo completo, sino un conjunto de adaptadores de bajo rango (LoRA) más un sidecar de acondicionamiento que se aplican sobre LTX-2.5, un transformer de difusión para generación de vídeo, junto con el adaptador de cámara SolarWM LTX-22B. La variante Teacher-27 incluye `hand-lora-ema-step27307.safetensors` y `hand-sidecar-step27307.safetensors`, entrenados hasta el paso 27307 con media móvil de pesos (EMA). La variante Causal-27 reutiliza exactamente esos mismos componentes de manos y añade `distill-lora-ema-step10240.safetensors`, una LoRA de destilación causal entrenada hasta el paso 10240.

El entrenamiento se orienta a la generación de vídeo egocéntrico condicionado por manos, con un protocolo de evaluación de primer fotograma que emplea `prefix_latents=1` y CFG 3, y un protocolo causal Q3 que usa `prefix_latents=8` (aproximadamente 2 segundos de contexto real). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la separación entre un componente de condicionamiento de manos (sidecar) y la LoRA de destilación causal, que permite pasar de generación bidireccional de fotograma inicial a muestreo autorregresivo por bloques.

## Capacidades

- Generación de vídeo image-to-video a partir de un primer fotograma, con 153 frames a 24 fps en el protocolo Teacher-27.
- Generación de vídeo egocéntrico condicionado por el movimiento y la posición de las manos.
- Muestreo autorregresivo por bloques en la variante Causal-27 (ventana 8, bloque 4), orientado a generación de secuencias largas.
- Modelado de mundo (world model) con adaptador de cámara SolarWM para control de la trayectoria de cámara.
- Destilación causal para reducir el coste de muestreo respecto al profesor.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni audio en la información disponible.

## Casos de uso

- Investigación en world models egocéntricos: el par Teacher-27/Causal-27 permite comparar generación bidireccional frente a autorregresiva sobre el mismo componente de manos, aislando el efecto de la destilación causal.
- Generación de vídeo de demostración para robótica y manipulación: el condicionamiento por manos permite sintetizar secuencias de agarre y movimiento útiles para aumentar datasets de aprendizaje por imitación.
- Simulación de trayectorias de cámara en primera persona: el adaptador SolarWM posibilita generar vistas con movimiento de cámara controlado para entrenar modelos de odometría visual o SLAM.
- Prototipado de contenido inmersivo: generación de clips de ~6,4 s a 24 fps a partir de un fotograma inicial para previsualizar escenas en primera persona.
- Evaluación de coherencia mano-entorno: uso del protocolo Q3 con `prefix_latents=8` para medir la consistencia temporal de la generación en ventanas de contexto cortas.
- Estudio de destilación en difusión de vídeo: la LoRA `distill-lora-ema-step10240` sirve como caso de estudio de destilación causal aplicada a un transformer de vídeo preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base LTX-2.5, del VAE de vídeo y del codificador de texto, cuyos pesos no se incluyen en este repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor remite al código de Hand2026 en ModelScope para preprocesado, caché de latentes y uso por línea de comandos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToucheWorld (Teacher-27 / Causal-27) | LoRA + sidecar sobre LTX-2.5 | Lightricks/LTX-2.5 + SolarWM | 153 frames a 24 fps (Teacher-27); ventana 8 / bloque 4 (Causal-27) | LTX-2.x Community License | Pesos de adaptadores en HuggingFace; código en ModelScope |
| Lightricks/LTX-2.5 | Modelo base de difusión de vídeo | Propio | no disponible | LTX-2.x Community License | HuggingFace |
| SolarWM LTX-22B camera adapter | Adaptador de cámara | LTX-2.5 | no disponible | no disponible | Dependencia externa, no incluida |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base LTX-2.5, su transformer, VAE de vídeo y codificador de texto, además del adaptador de cámara SolarWM, ninguno de los cuales se incluye en el repositorio.
- El código de inferencia compatible (acondicionamiento de manos y muestreo) solo está disponible por ahora en ModelScope; el lanzamiento del repositorio en GitHub está pendiente según el autor.
- La variante DMD aún no se ha publicado; sus pesos e instrucciones llegarán más adelante.
- La licencia LTX-2.x Community License impone condiciones de uso que deben consultarse antes de cualquier despliegue comercial; las dependencias obtenidas por separado mantienen sus propias licencias.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento de los adaptadores.
- El protocolo de evaluación causal Q3 exige `prefix_latents=8` (unos 2 segundos de contexto real), lo que limita la longitud de contexto efectiva en ese modo.

## Enlaces

- HuggingFace: https://huggingface.co/YJAYJA/ToucheWorld
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Código Hand2026 (ModelScope): https://modelscope.cn/models/yjayja/Hand2026-code
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Repositorio LTX-2: https://github.com/Lightricks/LTX-2
