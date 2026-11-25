# Teo-Bou/eflowdepth-ft-emotion

## Resumen

E-FlowDepth (mamba3) es un modelo de vision por computador desarrollado por el usuario Teo-Bou y publicado en Hugging Face bajo el identificador `Teo-Bou/eflowdepth-ft-emotion`. Se trata de la variante afinada (fine-tuning) de un modelo de estimacion de flujo optico, disparidad estereo, profundidad y scene flow a partir de camaras de eventos, entrenada sobre el dataset interno denominado `emotion`. El repositorio contiene principalmente artefactos de entrenamiento (checkpoints en formato PyTorch) y un informe de progreso y benchmarks, no una model card convencional de uso.

La relevancia del modelo reside en su enfoque: combina camaras de eventos (event-cameras) con una arquitectura basada en mamba-3 para resolver tareas de percepcion densa (optical flow, stereo disparity, scene flow) en escenarios de alta velocidad o iluminacion dificil, donde las camaras tradicionales rinden peor. El run `ft_emotion` documenta un entrenamiento muy corto (hasta el step 4) con una mejora de velocidad reportada de 2,77x (IWE Gain) en la fase inicial.

La informacion publica disponible es escasa: no hay datos sobre numero de parametros, contexto, licencia ni idiomas. El tamano del repositorio es de 0,2 GB y la libreria declarada es PyTorch. Esta ficha documenta lo que puede extraerse de la model card y advierte explicitamente de los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en mamba-3 (segun tags y titulo); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (SeqLen de entrenamiento: 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoints/best.pth`, `latest.pth`, `weights_only.pth`) |
| Tamano del repositorio | 0,2 GB |
| Tarea | Flujo optico, disparidad estereo, profundidad y scene flow (`Task: both`) |
| Dataset de entrenamiento | `emotion` |

## Arquitectura y entrenamiento

La arquitectura se anuncia como "mamba3" en el titulo del informe, lo que sugiere el uso de bloques de espacio de estados (SSM) de la familia Mamba en lugar de atencion transformer clasica, si bien la model card no detalla la topologia completa (encoder, cabezas de prediccion, fusion multimodal evento-imagen, etc.). El modelo esta orientado a percepcion densa con camaras de eventos: las metricas reportadas cubren flujo optico (EPE en px), disparidad estereo (MAE en px), profundidad (MAE en m) y scene flow (EPE en m/s), lo que implica cabezas de prediccion multiples sobre una representacion compartida.

El entrenamiento documentado corresponde al run `ft_emotion` sobre el dataset `emotion`, con `Task: both` y `SeqLen: 1`. El historial de benchmarks muestra solo cinco filas de progreso (steps 0, 2 y 4, con filas iniciales duplicadas), lo que indica un ajuste muy temprano: la perdida de entrenamiento cae de 3,4675 (step 2) a 1,9938 (step 4) y la ganancia IWE pasa de 2,77x a 2,68x. No se especifican el numero de tokens, la composicion del dataset, ni si hubo RLHF/DPO (no aplicable en un modelo de vision de este tipo). Se incluyen tres checkpoints: `best.pth` (estado completo), `latest.pth` (reanudable) y `weights_only.pth` (state_dict puro para inferencia).

## Capacidades

- Estimacion de flujo optico denso a partir de camaras de eventos (metrica EPE en pixeles).
- Estimacion de disparidad estereo (metrica MAE en pixeles).
- Estimacion de profundidad (metrica MAE en metros).
- Estimacion de scene flow (metrica EPE en m/s).
- Prediccion de flujo optico en regiones IMO (independient motion objects) segun la metrica `E-MOTION IMO Flow EPE`.
- Entrenamiento conjunto de tareas (`Task: both`), lo que sugiere multitarea flujo + profundidad/disparidad.
- No se documentan capacidades de generacion de texto, codigo, tool calling, agentes ni multilingues; es un modelo puramente de vision.

## Casos de uso

- Robotica de alta velocidad: estimacion de flujo optico y scene flow en tiempo real con camaras de eventos para navegacion y evitacion de obstaculos en escenarios con movimiento rapido, donde el flujo optico clasico falla por motion blur.
- Vehiculos autonomos y ADAS: calculo de profundidad y disparidad estereo en condiciones de iluminacion adversa (deslumbramiento, tuneles, noche) aprovechando la naturaleza asincrona de las camaras de eventos.
- Vision industrial: deteccion de movimiento y segmentacion de objetos independientes (IMO) en lineas de produccion a alta cadencia, usando las metricas de flujo IMO reportadas.
- Drones y UAV: estimacion de scene flow (m/s) para control de vuelo y estabilizacion con latencia baja, adecuada para plataformas con recursos limitados si el modelo cabe en el hardware de a bordo.
- Investigacion en percepcion event-based: punto de partida reproducible (checkpoints `best.pth` y `weights_only.pth`) para comparar arquitecturas mamba-3 frente a transformers en tareas de flujo y profundidad.
- Captura de movimiento y realidad aumentada: reconstruccion de profundidad y flujo a partir de sensores de eventos para seguimiento de manos o cuerpos en entornos con cambios bruscos de iluminacion.
- Benchmarking de datasets: el informe de progreso permite evaluar el modelo sobre los conjuntos DSEC y E-MOTION como referencia de rendimiento en flujo, disparidad y scene flow.

## Benchmarks y rendimiento

Resultados extraidos del informe de entrenamiento del run `ft_emotion` (steps 0 a 4):

| Step | Train Loss | IWE Gain | DSEC Flow EPE (px) | DSEC Disp MAE (px) | E-MOTION Flow EPE (px/s) | E-MOTION IMO Flow EPE | E-MOTION Depth MAE (m) | E-MOTION SceneFlow EPE (m/s) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | — | — | 2,855 | 6,931 | 142,05 | 200,33 | 1,417 | 6,190 |
| 2 | 3,4675 | 2,77x | 2,893 | 6,873 | 135,64 | 192,90 | 1,354 | 6,190 |
| 4 | 1,9938 | 2,68x | 2,810 | 6,305 | 142,05 | 195,38 | 1,121 | 6,092 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Las cifras corresponden a un entrenamiento de solo 4 steps, por lo que no deben interpretarse como rendimiento final del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el numero de parametros). El repositorio de 0,2 GB incluye tres checkpoints; el `weights_only.pth` es el mas ligero para inferencia.
- GPU recomendadas: no disponible. Al ser un modelo de vision basado en mamba-3, se espera compatibilidad con GPUs NVIDIA con CUDA; no se confirma soporte para otras plataformas.
- Cabe en GPU consumer: no disponible; sin el recuento de parametros no puede confirmarse. El tamano del checkpoint (dentro de 0,2 GB total) sugiere que el modelo es de escala pequena o media, pero es una inferencia no verificada.
- Opciones de despliegue: PyTorch nativo (los pesos son `state_dict` de PyTorch). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de referencia de otras arquitecturas event-based para flujo optico y profundidad.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: el historial muestra solo 4 steps, por lo que el modelo probablemente no esta convergido y su rendimiento en produccion seria muy limitado.
- Sin licencia declarada: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Sin model card de uso: no se documentan entradas esperadas, preprocesado, resolucion, formato de eventos ni procedimiento de inferencia.
- Sesgos: no disponibles; al entrenarse sobre el dataset `emotion` (composicion desconocida), puede heredar sesgos de captura (sensores, escenas, condiciones de iluminacion).
- Riesgo de alucinacion: no aplicable en el sentido linguistico, pero si existe riesgo de predicciones densas erroneas en regiones sin informacion de eventos.
- Limitaciones de idioma: no aplicable (modelo de vision).
- Metricas parciales: las cifras de benchmark corresponden a validacion temprana y no a un modelo final; no deben citarse como rendimiento consolidado.
- Dependencia de camaras de eventos: el modelo asume un tipo de sensor especifico, lo que restringe su aplicabilidad a hardware concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Teo-Bou/eflowdepth-ft-emotion
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
