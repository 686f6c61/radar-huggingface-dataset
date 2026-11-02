# TamAko783/anomalies-diffusion-dae-baseline

## Resumen

`anomalies-diffusion-dae-baseline` es un autoencoder desantificador (denoising autoencoder, DAE) con arquitectura U-Net, desarrollado por Experimental Machines (organización sin ánimo de lucro) y publicado por el usuario TamAko783 en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de investigación para la localización no supervisada de anomalías en imágenes de resonancia magnética cerebral (MRI). Concretamente, se entrena únicamente con sujetos sanos del dataset IXI (secuencia T2) y se evalúa sobre el dataset MSLUB, que contiene lesiones de esclerosis múltiple.

El modelo sirve como baseline barato frente al detector basado en difusión `anomalies-diffusion-andi`, del mismo autor. La idea subyacente es que un autoencoder entrenado para reconstruir tejido sano reconstruirá peor las regiones lesionadas, y ese error de reconstrucción actúa como mapa de anomalía. El checkpoint publicado corresponde al paso 5000 de entrenamiento (20 000 pasos totales) y ocupa solo 7,7 MB en formato safetensors, lo que refleja su escala reducida.

Es relevante ahora como pieza de un ecosistema de evaluación comparativa en detección de anomalías médicas: el autor publica métricas held-out, intervalos de confianza bootstrap, auditoría de calibración conforme y desglose de coste computacional. La licencia es CC BY-SA 3.0, heredada de la del dataset IXI. El propio autor advierte que es solo para investigación y que no está validado para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder desantificador convolucional tipo U-Net (`uadcal.detectors.dae.UNet`) |
| Parámetros totales | no disponible (pesos de 7,7 MB, lo que sugiere un modelo de muy baja escala) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos en safetensors sin indicación de variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (procesa volúmenes de MRI, no texto) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (`best_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es una U-Net convolucional que actúa como autoencoder desantificador: recibe un volumen de MRI con ruido grueso (coarse noise) y aprende a reconstruir la versión limpia. La arquitectura está implementada en el módulo `uadcal.detectors.dae.UNet` del repositorio de código del autor (commit `fe81d3a10768`). No se especifica en la información disponible el número exacto de capas, canales ni parámetros del backbone.

El entrenamiento se realizó sobre 319 sujetos sanos del dataset IXI en secuencia T2, durante 20 000 pasos, con un coste de 17 minutos de ajuste en una GPU NVIDIA L4. La selección de checkpoint se hizo sobre 10 sujetos de validación de MSLUB midiendo precisión media por vóxel (AP): el paso 5000 obtuvo AP 0,043, el 10000 obtuvo 0,030, el 15000 obtuvo 0,019 y el 20000 obtuvo 0,026. El autor reconoce que la selección es ruidosa con n = 10. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión de estas características.

## Capacidades

- Reconstrucción de volúmenes de MRI cerebral en secuencia T2 con eliminación de ruido grueso.
- Generación de mapas de error de reconstrucción por vóxel, utilizables como puntuación de anomalía.
- Localización aproximada de regiones lesionadas (esclerosis múltiple) mediante umbralización del mapa de error.
- Evaluación a nivel de vóxel (AP, Dice) y a nivel de exploración (AUROC).
- Inferencia rápida: 0,23 segundos por volumen en una GPU L4.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Baseline de referencia en investigación de detección de anomalías: sirve para comparar métodos más costosos (como el detector de difusión `anomalies-diffusion-andi`) contra un método barato y reproducible, con métricas held-out publicadas.
- Prototipado rápido de pipelines de detección de lesiones: al ejecutarse en 0,23 s por volumen en una L4 y costar aproximadamente 0,00004 USD por volumen, permite iterar sobre preprocesado y umbralización sin grandes presupuestos de cómputo.
- Auditoría de calibración conforme: el modelo se usa junto con `anomalies-diffusion-calibration` para estudiar si los umbrales calibrados solo con sujetos sanos mantienen la garantía de falsos positivos (FPR realizada de 0,035 con alpha 0,05 y 0,10 sobre 86 exploraciones sanas).
- Estudio de shift de dominio entre datasets: al entrenar con IXI y evaluar con MSLUB (distintos escáneres y poblaciones), permite cuantificar cuánto del rendimiento aparente se debe a diferencias de dominio frente a la detección real de lesiones.
- Enseñanza y reproducción de experimentos: el repositorio incluye `report.pdf`, `summary.json` con hashes SHA-256 del estado de entrenamiento y listas de sujetos, lo que facilita la replicación académica del experimento completo por unos 0,41 USD de cómputo.
- Comparación de coste/beneficio en despliegues de investigación: útil para decidir si un detector más caro aporta ganancia suficiente frente a este baseline en un entorno concreto antes de invertir en infraestructura.

## Benchmarks y rendimiento

Resultados held-out sobre MSLUB test (20 exploraciones, media con intervalo de confianza bootstrap del 95 % sobre sujetos):

| Métrica | DAE | Baseline de intensidad |
|---|---|---|
| Voxel AP | 0,079 [0,036; 0,132] | 0,022 |
| Dice (umbral ajustado en validación) | 0,107 | 0,048 |
| AUROC por exploración (dominio + lesión) | 0,600 | 0,655 |
| Recall de componentes de lesión | 8,4 % | 42,7 % |
| Segundos por volumen (L4) | 0,23 | 0,02 |

Resultados de selección de checkpoint sobre 10 sujetos de validación MSLUB (AP por vóxel): paso 5000 = 0,043; paso 10000 = 0,030; paso 15000 = 0,019; paso 20000 = 0,026.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado que los pesos ocupan 7,7 MB; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: NVIDIA L4 (referencia medida por el autor, 0,23 s por volumen); cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión de este tipo); el despliegue se haría mediante el código Python del repositorio `uadcal` cargando el checkpoint safetensors.
- Latencia y throughput: 0,23 s por volumen en L4; coste aproximado de 0,00004 USD por volumen. El entrenamiento completo de 20 000 pasos tardó 17 minutos en una L4.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Voxel AP (MSLUB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `anomalies-diffusion-dae-baseline` (este) | DAE U-Net | no disponible (7,7 MB) | no aplica | 0,079 | CC BY-SA 3.0 | HuggingFace |
| `anomalies-diffusion-andi` | Detector basado en difusión | no disponible | no aplica | no disponible en esta ficha | no disponible | HuggingFace (referenciado) |
| Baseline de intensidad | Heurístico | 0 | no aplica | 0,022 | no aplica | Referencia interna del autor |

No se dispone de datos de benchmarks de otros modelos comparables de detección de anomalías en MRI en la información proporcionada.

## Limitaciones y advertencias

- Solo para investigación: el autor indica explícitamente que no está validado para uso clínico.
- Entrenado con una única mezcla de sitios (IXI Guys/HH/IOP), lo que limita la generalización a otros escáneres y poblaciones.
- Evaluación con solo 20 exploraciones con lesión, todas de una única población de lesión (esclerosis múltiple); los intervalos de confianza son amplios.
- Selección de checkpoint realizada sobre 10 exploraciones, reconocida como ruidosa por el autor.
- El AUROC por exploración (0,600) es inferior al del baseline de intensidad (0,655), y el recall de componentes de lesión es muy bajo (8,4 % frente a 42,7 %), lo que indica que el modelo detecta mal lesiones a nivel de componente.
- El rendimiento a nivel de exploración está confundido por el shift de dominio entre IXI (entrenamiento) y MSLUB (test), con distintos escáneres y poblaciones.
- Los umbrales calibrados solo con sujetos sanos dejan el detector casi silencioso en MSLUB (Dice 0,032), y no se sostiene ninguna afirmación sobre sesgo de grupo con este tamaño de muestra.
- Licencia CC BY-SA 3.0: impone compartir-al-igual sobre obras derivadas, lo que puede condicionar su uso comercial o su integración en productos propietarios.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y negativos en la localización de lesiones.

## Enlaces

- HuggingFace: https://huggingface.co/TamAko783/anomalies-diffusion-dae-baseline
- Modelo de difusión comparado (referenciado en la model card): `anomalies-diffusion-andi`
- Repositorio de calibración (referenciado en la model card): `anomalies-diffusion-calibration`
- Dataset de entrenamiento: IXI (CC BY-SA 3.0)
- Dataset de evaluación: MSLUB
- Código: repositorio `uadcal`, commit `fe81d3a10768` (no se proporciona URL directa en la información disponible)
