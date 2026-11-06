# TamAko783/anomalies-diffusion-andi-60k

## Resumen

ANDi-60k es un modelo de difusión en espacio de píxeles diseñado para la localización de anomalías en resonancia magnética cerebral (secuencias T2 axiales) sin necesidad de etiquetas de lesión. Lo desarrolla *Experimental Machines*, una organización sin ánimo de lucro, como reimplementación independiente de la idea de Frotscher et al. (arXiv:2312.01904), conocida como Aggregated Normative Diffusion (ANDi). El modelo aprende la distribución de tejido sano y genera un mapa de anomalías a partir de la diferencia entre la posterior media del proceso inverso y la implicada por la imagen de entrada, agregada sobre pasos de bajo ruido.

Se trata de una U-Net de 6,43 millones de parámetros, entrenada sobre 319 exploraciones T2 de sujetos sanos del dataset IXI, con cortes axiales de 128x128 píxeles. El checkpoint publicado corresponde a 60.000 pasos de entrenamiento, continuación de una ejecución previa de 20.000 pasos. El paquete de código `uadcal` necesario para cargar y puntuar el modelo no está publicado todavía, por lo que los pesos no son utilizables sin reimplementar la arquitectura.

Su relevancia es metodológica más que de rendimiento: el trabajo acompaña al modelo con una calibración conformal solo sobre sanos y una auditoría de sesgo, y publica comparaciones honestas frente a una línea base de autoencoder y una línea base de intensidad. Los resultados muestran que el modelo de difusión no supera de forma clara a la línea base barata y cuesta unas 21 veces más por volumen, lo que lo convierte en una referencia reproducible para estudios de coste/beneficio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusión en espacio de píxeles (v-prediction, schedule log-SNR coseno desplazado) |
| Parametros totales | 6,43 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; entrada de 128x128 píxeles por corte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del modelo; la tarea es de imagen, no de texto) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (`best_model.safetensors`, 25,8 MB, pesos EMA, paso 60000) |

## Arquitectura y entrenamiento

La red es una U-Net con anchura base 32, multiplicadores de canal (1, 2, 2, 3, 4), dos bloques residuales por nivel, self-attention en resoluciones 16x16 y 8x8, y dropout de 0,1 en los niveles de 32x32 y menores. Emplea predicción v y un schedule de log-SNR coseno desplazado. El mapa de anomalías se obtiene agregando, sobre pasos temporales de bajo ruido (cada décimo paso), la diferencia entre la media posterior del proceso inverso del modelo y la que implica la propia imagen de entrada.

El entrenamiento usó AdamW con lr constante de 1e-4, batch de 32, EMA de 0,9995 y autocast en bf16, durante 60.000 pasos. La ejecución continuó desde un checkpoint de 20.000 pasos restaurando red, EMA, optimizador y orden de datos, aunque el RNG de dropout se re-sembró, por lo que no es bit a bit idéntica a una ejecución ininterrumpida. Los datos son 319 exploraciones T2 de sujetos sanos de IXI (sedes Guy's, Hammersmith e IOP), con split hasheado a nivel de sujeto y sin sujetos de calibración o test en entrenamiento. El preprocesado incluye corrección de sesgo N4, skull-stripping con HD-BET, registro afín a SRI24, normalización de intensidad por moda del histograma y extracción de cortes axiales centrales a 128x128. Respecto al artículo original, el modelo usa una red más pequeña, ruido gaussiano simple (sin ruido piramidal), muchos menos pasos y puntuación cada décimo paso temporal; el autor advierte explícitamente que las cifras no son comparables con las publicadas.

## Capacidades

- Detección no supervisada de anomalías en cortes axiales T2 de RM cerebral preprocesados como los datos de entrenamiento.
- Generación de mapas de anomalía a nivel de vóxel mediante agregación de diferencias en la posterior del proceso inverso.
- Localización de regiones candidatas (segmentación binaria tras umbralizado) y puntuación por componente conectada.
- Calibración conformal con garantía de tasa de falsos positivos, calculada solo sobre sujetos sanos (realizada sobre el modelo de 20k, no re-ejecutada para 60k).
- Auditoría de sesgo por subgrupos (edad, sexo, sede) sobre las puntuaciones del detector.
- Reproducibilidad como línea base: arquitectura especificada para reimplementación y pesos publicados en safetensors.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo thinking; es un modelo de imagen especializado y de un único dominio.

## Casos de uso

- Investigación en detección de anomalías no supervisadas: sirve como línea base reproducible para comparar detectores de difusión frente a autoencoders en T2 cerebral, con pesos y protocolo de evaluación documentados.
- Estudios de calibración conformal en imagen médica: el modelo y su repositorio de calibración permiten reproducir el análisis de tasa de falsos positivos con umbrales calibrados solo sobre sanos (FPR realizado de 0,047 con alpha 0,05 y 0,128 con alpha 0,10 sobre 86 exploraciones sanas).
- Análisis de coste/beneficio de detectores generativos: con 4,86 s por volumen en una GPU L4 frente a 0,23 s del autoencoder, permite cuantificar el coste computacional de la difusión en pipelines de investigación.
- Auditoría de sesgo y equidad en modelos médicos: el repositorio de calibración incluye el análisis por subgrupos de edad, sexo y sede, reutilizable como plantilla metodológica.
- Validación de pipelines de preprocesado de RM: al exigir N4, HD-BET, registro a SRI24 y normalización por moda del histograma, sirve para probar la reproducibilidad de una cadena de preprocesado completa.
- Docencia y formación en modelos generativos aplicados a imagen médica: la arquitectura pequeña (6,43 M de parámetros) y el checkpoint de 25,8 MB permiten estudiar el mecanismo ANDi sin grandes recursos de cómputo.
- Estudio de dataset shift: la caída de Dice a 0,012 al aplicar el umbral calibrado sobre sanos a la cohorte MSLUB ilustra de forma cuantitativa el efecto del cambio de dominio entre escáneres y poblaciones.

## Benchmarks y rendimiento

Evaluación sobre 20 exploraciones T2 de esclerosis múltiple de MSLUB (otras 10 se usaron solo para elegir checkpoint y umbral). Media sobre exploraciones con intervalo de confianza bootstrap del 95 % entre sujetos.

| Metrica | ANDi 60k | ANDi 20k | DAE baseline | Intensity baseline |
|---|---|---|---|---|
| Voxel AP | 0,090 [0,060; 0,123] | 0,084 [0,057; 0,114] | 0,079 [0,036; 0,132] | 0,022 |
| Dice (umbral ajustado en validación) | 0,125 [0,088; 0,163] | 0,120 [0,084; 0,157] | 0,107 | 0,048 |
| Voxel AUROC | 0,707 | 0,701 | no disponible | 0,655 |
| Recall de componentes de lesión | 23,4 % | 22,4 % | 8,4 % | 42,7 % |
| Segundos por volumen (GPU L4) | 4,86 | 4,84 | 0,23 | 0,02 |

Comparaciones pareadas adicionales:

| Comparacion | AP | Dice | Otros |
|---|---|---|---|
| 60k menos 20k | +0,0056 [+0,0021; +0,0102] | +0,0051 [+0,0008; +0,0110] | Mejor en 16 y 15 de 20 exploraciones |
| 60k menos DAE | +0,011 [-0,036; +0,056] | +0,018 [-0,032; +0,067] | AUROC a nivel de exploración +0,107 [+0,067; +0,146] |

AP de validación por pasos (10k a 60k): 0,070; 0,081; 0,086; 0,087; 0,089; 0,092, sin plateau. Calibración conformal sobre sanos (modelo de 20k): FPR realizado de 0,047 con alpha 0,05 y 0,128 con alpha 0,10, ambos dentro de la banda de validez del 99 %. Con umbral calibrado sobre sanos, el detector es casi silencioso en MSLUB (Dice 0,012 con alpha 0,05).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,43 M de parámetros y entrada de 128x128, el checkpoint de 25,8 MB cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor reporta 4,86 s por volumen en una NVIDIA L4; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, por el reducido tamaño del modelo y de la resolución de entrada.
- Opciones de despliegue: no disponibles mediante vLLM, llama.cpp, Ollama o TGI (no es un modelo de lenguaje). Requiere el paquete `uadcal`, no publicado, o una reimplementación de la arquitectura descrita.
- Latencia y throughput: 4,86 s por volumen en L4 para el modelo de 60k; 4,84 s para el de 20k; 0,23 s para el autoencoder y 0,02 s para la línea base de intensidad.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Voxel AP | Dice | Recall de lesión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ANDi 60k (este) | 6,43 M | 128x128, T2 axial | 0,090 | 0,125 | 23,4 % | CC BY-SA 3.0 | Pesos publicados; código no publicado |
| ANDi 20k | 6,43 M | 128x128, T2 axial | 0,084 | 0,120 | 22,4 % | CC BY-SA 3.0 | Pesos publicados; código no publicado |
| DAE baseline | no disponible | 128x128, T2 axial | 0,079 | 0,107 | 8,4 % | no disponible | Repositorio propio |
| Intensity baseline | no disponible | 128x128, T2 axial | 0,022 | 0,048 | 42,7 % | no disponible | Repositorio propio |

No se dispone de comparación con implementaciones de referencia de ANDi del artículo original (Frotscher et al.) porque el repositorio upstream no tiene licencia y las cifras no son comparables según el propio autor.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico, no está validado para uso clínico y no debe guiar la atención al paciente.
- El dataset shift domina los resultados: entrenamiento y calibración provienen de IXI y la evaluación de MSLUB, con escáneres y poblaciones distintos; las puntuaciones mezclan cambio de dominio con lesiones.
- Evaluación pequeña y estrecha: 20 exploraciones de test, una sola enfermedad (esclerosis múltiple) y una sola cohorte de lesiones; la selección de checkpoint sobre 10 exploraciones es ruidosa y los resultados se conocieron antes de la auditoría de calibración, por lo que no constituyen evidencia confirmatoria pre-registrada.
- No se ha demostrado superioridad frente a la línea base barata: las diferencias pareadas con el DAE son indistinguibles de cero y el coste por volumen es unas 21 veces mayor.
- Equidad no establecida: IXI tiene tres sedes (una con 7 exploraciones de test) y metadatos gruesos de edad y sexo; la auditoría no confirmó disparidad de grupo, pero una asociación nominal (edad 40-59 frente a menores de 40, ANDi con alpha 0,10, p = 0,009) es exploratoria y no corregida por multiplicidad.
- Fuera de alcance: diagnóstico, triaje, cribado o cualquier decisión clínica; otras secuencias (T1, FLAIR), otras partes del cuerpo, población pediátrica o preprocesados distintos.
- No interpretar una región marcada como lesión ni una exploración no marcada como sana.
- Los pesos no son cargables sin el paquete `uadcal`, no publicado; la arquitectura está especificada para reimplementación y el código se ofrece a petición de los autores.
- Licencia CC BY-SA 3.0: permite uso comercial con atribución y compartir igual, pero las restricciones de uso clínico y la falta de validación limitan su aplicación en producción sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TamAko783/anomalies-diffusion-andi-60k
- Modelo de 20k pasos: https://huggingface.co/TamAko783/anomalies-diffusion-andi
- Línea base de autoencoder: https://huggingface.co/TamAko783/anomalies-diffusion-dae-baseline
- Calibración conformal y auditoría de sesgo: https://huggingface.co/TamAko783/anomalies-diffusion-calibration
- Artículo de referencia (Frotscher et al.): https://arxiv.org/abs/2312.01904
- Dataset IXI: https://brain-development.org/ixi-dataset/
- Dataset MSLUB (Lesjak et al., Neuroinformatics 2017): no disponible enlace directo en la información proporcionada
