# TamAko783/anomalies-diffusion-andi

## Resumen

ANDi (Anomaly Detection with Diffusion) es un modelo de difusión experimental para la localización no supervisada de anomalías en resonancias magnéticas cerebrales. Lo publica el usuario TamAko783 bajo la etiqueta "Experimental Machines (non-profit)" y constituye una reimplementación independiente de la idea descrita en el paper arXiv:2312.01904, sin reutilizar código del repositorio original (que carece de licencia). El modelo aprende la distribución de cerebros sanos y detecta desviaciones respecto a esa norma, de modo que no requiere ejemplos de lesión durante el entrenamiento.

Técnicamente es un U-Net de ruido de 6,43 millones de parámetros que opera sobre cortes de 128x128 píxeles, entrenado con ruido gaussiano estándar durante 20.000 pasos sobre 319 sujetos sanos del dataset IXI en modalidad T2. El checkpoint publicado (`best_model.safetensors`, 25,8 MB) corresponde al paso 20.000 y, según el propio autor, sigue mejorando con más entrenamiento, por lo que se declara explícitamente infraentrenado.

Su relevancia es metodológica y de reproducibilidad: documenta con detalle los resultados en el conjunto de test retenido MSLUB, el coste de cómputo (unos 1,08 dólares en una NVIDIA L4) y una auditoría de calibración sobre cerebros sanos. El propio autor advierte que, con 21 veces el coste de inferencia de un autoencoder denoising (DAE), ANDi no supera de forma demostrable a este último en localización en este contexto. Es un artefacto de investigación, no validado para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de difusión para predicción de ruido (`DenoiseUNet`, pesos EMA) |
| Parámetros totales | 6,43 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, cortes de 128x128 píxeles) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión nativa) |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (`best_model.safetensors`, 25,8 MB) |

## Arquitectura y entrenamiento

El modelo es un U-Net de difusión que predice el ruido añadido a imágenes, con un tamaño reducido de 6,43 M de parámetros frente a la configuración del paper original. Se entrena sobre cortes axiales de 128x128 píxeles con ruido gaussiano estándar, sin schedule de ruido especial ni modificaciones del proceso de difusión. El entrenamiento se limita a 20.000 pasos (0,27 s/paso, 89,5 minutos en una NVIDIA L4), con pesos EMA como checkpoint final.

La puntuación de anomalía se calcula agregando la media geométrica de los errores por timestep en el rango de timesteps 125 a 26, con un stride de 10. El conjunto de entrenamiento son 319 sujetos sanos del dataset IXI en T2. La selección de checkpoint se hizo sobre 10 sujetos de validación de MSLUB, midiendo AP por vóxel y por escaneo, con valores de 0,055 / 0,070 / 0,075 / 0,081 en los pasos 5k / 10k / 15k / 20k, todavía en ascenso en el paso 20k. Existe una continuación de 60.000 pasos en el repositorio `anomalies-diffusion-andi-60k` (AP de test 0,090 frente a 0,084, ganancia emparejada de +0,0056 con intervalo de confianza que excluye el cero).

## Capacidades

- Detección no supervisada de anomalías en imágenes de RM cerebral: aprende solo de cerebros sanos y puntúa desviaciones sin necesidad de ejemplos de lesión.
- Localización por vóxel: genera mapas de error que permiten identificar regiones anómalas dentro del volumen.
- Puntuación a nivel de escaneo: produce una medida agregada por volumen para clasificación binaria sano/anómalo.
- Inferencia sobre cortes 2D de 128x128 píxeles en modalidad T2.
- Reproducibilidad: incluye hashes SHA-256 del checkpoint y de las listas de sujetos en `summary.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen.

## Casos de uso

- Investigación en detección de anomalías médicas: sirve como línea base reproducible para comparar métodos de difusión frente a autoencoders denoising en localización de lesiones. Su documentación de resultados y coste lo hace adecuado para estudios comparativos.
- Auditoría de calibración en datos sanos: el repositorio asociado `anomalies-diffusion-calibration` permite evaluar tasas de falsos positivos (FPR realizado de 0,047 con alfa 0,05 y 0,128 con alfa 0,10 sobre 86 escaneos sanos) y validar umbrales operativos.
- Reproducción de experimentos con presupuesto mínimo: el entrenamiento completo cuesta aproximadamente 1,08 dólares en una NVIDIA L4, lo que permite replicar el pipeline en entornos académicos con recursos limitados.
- Generación de mapas de error para inspección cualitativa: los mapas de error por timestep pueden visualizarse para estudiar qué regiones activan el modelo ante lesiones de esclerosis múltiple.
- Estudio de sensibilidad al desajuste de dominio: el propio autor señala que IXI y MSLUB difieren en escáner y población, por lo que el modelo es útil para investigar cómo afecta el dataset shift a la separación a nivel de escaneo.
- Punto de partida para extensiones: al ser una reimplementación independiente y con licencia clara (CC BY-SA 3.0), puede servir como base para experimentos con U-Nets mayores, más pasos o schedules de ruido alternativos.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido MSLUB (20 escaneos), con media e intervalo de confianza bootstrap del 95% por sujeto:

| Métrica | ANDi | DAE | Línea base de intensidad |
|---|---|---|---|
| AP por vóxel | 0,084 [0,057; 0,114] | 0,079 [0,036; 0,132] | 0,022 |
| Dice (umbral ajustado en validación) | 0,120 [0,084; 0,157] | 0,107 | 0,048 |
| AUROC por escaneo (dominio + lesión) | 0,701 | 0,600 | 0,655 |
| Recall de componentes de lesión | 22,4% | 8,4% | 42,7% |
| Segundos por volumen (L4) | 4,84 | 0,23 | 0,02 |

Diferencias emparejadas ANDi menos DAE: AP +0,006 [-0,045; 0,050] y Dice +0,013 [-0,041; 0,064], no distinguibles de cero con 20 sujetos; AUROC +0,100 [0,060; 0,140], con ANDi mejor en 15 de 20 escaneos. A 21 veces el coste de inferencia, ANDi no supera de forma demostrable al DAE en localización en este contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en el orden de cientos de MB, dado que el checkpoint pesa 25,8 MB y el U-Net tiene 6,43 M de parámetros; no se ha publicado una cifra exacta.
- GPU recomendadas: el autor reporta 4,84 s por volumen en una NVIDIA L4; cualquier GPU consumer moderna debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, con amplio margen, por el reducido tamaño del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de imagen, requeriría un pipeline propio en PyTorch que cargue el safetensors.
- Latencia y throughput: 4,84 s por volumen en L4, aproximadamente 0,0008 dólares por volumen; el entrenamiento completo costó 5.373 s (89,5 minutos) para 20.000 pasos a 0,27 s/paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | AP por vóxel (MSLUB test) | AUROC por escaneo | Licencia |
|---|---|---|---|---|---|
| ANDi (este modelo) | 6,43 M | Difusión (U-Net de ruido) | 0,084 | 0,701 | CC BY-SA 3.0 |
| DAE (autoencoder denoising) | no disponible | Autoencoder denoising | 0,079 | 0,600 | no disponible |
| Línea base de intensidad | no aplica | Umbral sobre intensidad | 0,022 | 0,655 | no disponible |
| ANDi 60k (continuación) | 6,43 M | Difusión, 60.000 pasos | 0,090 | no disponible | CC BY-SA 3.0 |

No se dispone de datos comparativos con otras implementaciones públicas del paper arXiv:2312.01904, dado que el autor indica que los resultados no son comparables con los publicados por diferencias en configuración.

## Limitaciones y advertencias

- Modelo declarado explícitamente infraentrenado: la AP seguía subiendo en el paso 20.000, por lo que el checkpoint publicado no representa el techo del enfoque.
- Validación limitada: solo 20 escaneos con lesión en el conjunto de test y una única población de lesión (esclerosis múltiple).
- Un solo centro de entrenamiento: el modelo se entrena con IXI y se evalúa con MSLUB, que difieren en escáner y población; la separación a nivel de escaneo está confundida por el dataset shift.
- Selección de checkpoint ruidosa: se eligió sobre 10 sujetos de validación, lo que introduce variabilidad.
- No validado para uso clínico: el autor lo etiqueta como "Research only".
- Licencia CC BY-SA 3.0: impone compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la redistribución.
- Calibración en sanos: con umbrales calibrados sobre cerebros sanos, el Dice en MSLUB cae a 0,012 (alfa 0,05), lo que limita su uso operativo con umbrales estrictos.
- Sin capacidades de texto, tool calling ni agentes: es exclusivamente un modelo de imagen.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos y de mapas de error poco fiables fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TamAko783/anomalies-diffusion-andi
- Continuación de 60.000 pasos: https://huggingface.co/TamAko783/anomalies-diffusion-andi-60k
- Repositorio de auditoría de calibración: https://huggingface.co/TamAko783/anomalies-diffusion-calibration
- Paper de referencia: https://arxiv.org/abs/2312.01904
