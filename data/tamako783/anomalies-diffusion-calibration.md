# TamAko783/anomalies-diffusion-calibration

## Resumen

`anomalies-diffusion-calibration` es un repositorio de investigación publicado por TamAko783 (Experimental Machines, entidad sin ánimo de lucro) que no contiene un modelo generativo al uso, sino la auditoría estadística de dos detectores no supervisados de anomalías en resonancia magnética cerebral: `anomalies-diffusion-dae-baseline` (un autoencoder denoising, DAE) y `anomalies-diffusion-andi` (una reimplementación independiente de ANDi). El trabajo aborda una pregunta metodológica concreta: si es posible fijar el umbral de alarma de un detector de anomalías utilizando únicamente exploraciones sanas, con una garantía de muestra finita sobre la tasa de falsos positivos, y si esa garantía se mantiene por igual entre centro de escáner, franja de edad y sexo.

El repositorio aplica calibración conformal split sobre un conjunto de calibración sano (173 escáneres IXI T2 de tres centros: Guys, HH e IOP), con variantes aleatorizada y conservadora (Bates et al., Ann. Stat. 2023), variantes Mondrian por grupo, corrección Benjamini-Hochberg y Storey-BH para lotes, y control de riesgo conformal para un presupuesto de volumen de lesión falso (Angelopoulos et al., ICLR 2024). El resultado se valida contra un test sano independiente de 86 escáneres y se contrasta con el conjunto MSLUB de esclerosis múltiple (10 de validación, 20 de test).

Su relevancia es fundamentalmente metodológica y de reproducibilidad: demuestra empíricamente que la calibración solo con sanos funciona como chequeo de validez (la tasa de falsos positivos realizada cae dentro de la banda binomial del 99 % en ambos detectores) y, al mismo tiempo, documenta con rigor que no puede sostenerse ninguna afirmación de sesgo grupal con estos tamaños muestrales. No almacena datos de RM; solo agregados. Es material de auditoría, no un checkpoint listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: auditoría de dos detectores no supervisados (DAE denoising autoencoder y reimplementación de ANDi) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada volumétrica 128x128 en ANDi; no disponible para DAE) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (imagen médica; metadatos en inglés) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | No disponible (el repositorio contiene artefactos derivados y agregados de auditoría, no se especifica formato de pesos) |

## Arquitectura y entrenamiento

El repositorio no entrena un transformer ni un modelo de lenguaje. El detector DAE es un autoencoder denoising entrenado durante 20 000 pasos sobre 319 escáneres IXI T2 sanos; el detector ANDi es una reimplementación independiente de menor tamaño de red, con entrada 128x128 y un número de pasos muy inferior al del ANDi publicado, por lo que sus cifras no son comparables con las del trabajo original. La puntuación por escáner se obtiene del detector y se transforma en p-valores conformales a partir de un conjunto de calibración sano reservado (173 escáneres de tres centros), con variantes aleatorizada y conservadora, Mondrian por grupo, BH y Storey-BH para lotes, y control de riesgo conformal para un presupuesto de volumen de lesión falso.

Los protocolos de umbral evaluados son cuatro: P2 (óptimo por Dice sobre validación con lesiones), P3 (percentil 99,5 de vóxeles sanos) y P4 (garantía conformal de lesión falsa a alpha 0,05 y 0,10). La partición es a nivel de sujeto y con hash, y el pipeline verifica que ningún sujeto de entrenamiento aparece en calibración ni en test. La validación G0 exige que la tasa de falsos positivos realizada en un test sano independiente caiga dentro de la banda binomial del 99 % alrededor de alpha. El cómputo se ejecutó en Runpod Secure Cloud (EU-RO-1) con disciplina de un solo Pod por etapa, con un coste total estimado de unos 2,2 dólares para las tres etapas principales (aproximadamente 3 h 42 min de reloj en GPU L4 a 0,59 $/h).

## Capacidades

- Detección no supervisada de anomalías en RM cerebral entrenada solo con sujetos sanos.
- Calibración conformal del umbral de alarma con garantía de muestra finita sobre la tasa de falsos positivos.
- Variantes conformales aleatorizada y conservadora, y variantes Mondrian por grupo (centro, franja de edad, sexo).
- Control de riesgo conformal para un presupuesto de volumen de lesión falso (alpha 0,05 y 0,10).
- Corrección de multiplicidad para lotes mediante Benjamini-Hochberg y Storey-BH.
- Auditoría de equidad por centro de escáner, franja de edad y sexo, con modelo logístico ajustado por las tres variables.
- Validación de validez G0 contra un test sano independiente con banda binomial del 99 %.
- Reproducibilidad: particiones con hash a nivel de sujeto y verificación automática de no solapamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni capacidades multilingües; su ámbito es exclusivamente la imagen médica y la estadística de calibración.

## Casos de uso

- Auditoría de validez de un detector de anomalías antes de desplegarlo: el protocolo G0 permite comprobar, con un test sano independiente, que la tasa de falsos positivos realizada cae dentro de la banda binomial del 99 % alrededor de alpha, tal como se verificó para DAE (0,035 a alpha 0,05) y ANDi (0,047 a alpha 0,05).
- Fijación de umbrales operativos sin acceso a datos patológicos: la calibración solo con sanos (P4) permite establecer un umbral con garantía de muestra finita cuando no se dispone de un conjunto etiquetado de lesiones, escenario habitual en despliegues reales.
- Control de calidad por lote en un pipeline de cribado: las correcciones BH y Storey-BH permiten gestionar la tasa de falsos descubrimientos al procesar lotes de escáneres, aunque el estudio documenta que la potencia de BH por lotes es 0 para ANDi con umbrales P4.
- Auditoría de equidad entre centros de escáner: el análisis Mondrian por centro (Guys, HH, IOP) y el modelo logístico ajustado permiten detectar desviaciones de la tasa de falsos positivos entre sitios, como el 0,180 de ANDi en Guys frente al 0,000 en HH e IOP a alpha 0,10.
- Diseño de estudios confirmatorios: los intervalos y el código de auditoría (`audit.json`) sirven como plantilla para pre-registrar un test confirmatorio con tamaños muestrales adecuados, dado que este estudio no lo es.
- Reproducción metodológica en otros dominios de imagen médica: la combinación de calibración conformal split, Mondrian y control de riesgo conformal es transferible a cualquier detector de anomalías entrenado solo con sanos (mamografía, retinografía, TC torácica) que necesite garantías de falsos positivos.
- Evaluación crítica de afirmaciones de sesgo: el repositorio documenta explícitamente que el único término nominalmente significativo (ANDi, alpha 0,10, edad 40-59 frente a menores de 40, OR 0,045, IC 95 % 0,005-0,46, p = 0,009, 81 escáneres) es una hipótesis exploratoria sin corrección por multiplicidad, útil como referencia de buenas prácticas al revisar literatura.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test sano IXI (n = 86), con checkpoints elegidos previamente sobre validación MSLUB:

| Comprobación | DAE (paso 5000) | ANDi (paso 20000) |
|---|---|---|
| FPR realizada a alpha 0,05 (banda 99 %: 0-0,140) | 0,035 (dentro) | 0,047 (dentro) |
| FPR realizada a alpha 0,10 (banda 99 %: 0,023-0,209) | 0,035 (dentro) | 0,128 (dentro) |
| FPR por centro a alpha 0,10, umbral agrupado: Guys / HH / IOP (n = 61 / 18 / 7) | 0,033 / 0,056 / 0,000 | 0,180 / 0,000 / 0,000 |
| FPR por edad a alpha 0,10: <40 / 40-59 / >=60 (n = 27 / 29 / 25) | 0,111 / 0,000 / 0,000 | 0,259 / 0,034 / 0,120 |
| Dice en MSLUB, umbral P4 a alpha 0,05 | 0,032 | 0,012 |
| Dice en MSLUB, umbral P3 (percentil sano) | 0,096 | 0,111 |
| Dice en MSLUB, umbral P2 (ajustado en validación con lesiones) | 0,107 | 0,121 |

Los valores grupales son estimaciones puntuales; los intervalos están en `audit.json`. El AUROC a nivel de escáner del DAE de 0,99 (MSLUB frente a IXI) refleja cambio de dominio (escáner y población), no detección de lesiones, según advierte el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican parámetros ni tamaño de los checkpoints; ANDi opera con entrada 128x128 y una red de menor tamaño que la del ANDi publicado.
- GPU utilizadas en el estudio: NVIDIA L4 (0,59 $/h en Runpod Secure Cloud, EU-RO-1) para el entrenamiento del DAE (unos 42 min, 17 min de ajuste) y de ANDi (1 h 50 min, 89,5 min de ajuste). La GPU asignada al Pod de auditoría de calibración no se registró; el rango de coste cubre todas las GPU permitidas (0,28-1,05 $).
- ¿Cabe en GPU de consumo? No disponible con los datos publicados; por el tamaño reducido de ANDi (128x128) es plausible, pero no está documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline es código de investigación propio ejecutado en Pods de Runpod con volumen de red de 550 GB (0,07 $/GB-mes).
- Latencia y throughput: no disponibles. El estudio reporta tiempos de pared por etapa (42 min, 1 h 50 min y unos 70 min para preprocesar 259 escáneres IXI y puntuar 289 escáneres con dos detectores), no latencias por muestra.
- Coste total estimado de las tres etapas principales: aproximadamente 2,2 $ (unas 3 h 42 min de reloj), sin incluir Pods de desarrollo anteriores ni la parte proporcional del volumen de red compartido.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Contexto / entrada | Garantía de FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anomalies-diffusion-calibration (este) | Auditoría conformal de detectores | Solo sanos (IXI T2) | Volumétrica, 128x128 en ANDi | Sí, muestra finita validada (G0) | CC BY-SA 3.0 | Hugging Face, 0 descargas |
| ANDi publicado | Detector de anomalías con difusión | Solo sanos | No disponible en esta ficha | No documentada aquí | No disponible | No disponible |
| DAE baseline (`anomalies-diffusion-dae-baseline`) | Autoencoder denoising | Solo sanos (319 IXI T2) | No disponible | Calibrado en este estudio | CC BY-SA 3.0 (derivados) | Hugging Face |
| Detectores supervisados de lesión (p. ej. segmentación MS) | Segmentación supervisada | Con etiquetas de lesión | No disponible | No aplica | Variable | Variable |

No se dispone de datos comparativos de rendimiento (Dice, AUROC) de alternativas en la información proporcionada; la comparativa se limita a metodología, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo para investigación: no validado para uso clínico. No almacena datos de RM, únicamente agregados.
- No se confirma ninguna afirmación de sesgo grupal. El único término nominalmente significativo (ANDi, alpha 0,10, edad 40-59 frente a <40, OR 0,045, IC 95 % 0,005-0,46, p = 0,009) es uno de muchos tests exploratorios sin corrección por multiplicidad, con pocos escáneres marcados (81 en el modelo ajustado): es una hipótesis, no un hallazgo.
- El centro IOP tiene solo 7 escáneres de test y no es estimable; el resto de diferencias grupales no se distingue del ruido con estos tamaños.
- La regresión del modelo de bandera del DAE es degenerada (separación perfecta; 36 valores no finitos almacenados como nulos). El autor indica ignorarla.
- El AUROC de 0,99 del DAE a nivel de escáner refleja cambio de dominio (escáner y población), no detección de lesiones.
- Los umbrales calibrados solo con sanos (P4) dejan los detectores casi silenciosos en MSLUB (Dice 0,012-0,032; potencia de BH por lotes 0 para ANDi). El autor infiere, sin testear, que el umbral calibrado en IXI queda lejos del rango de puntuaciones de lesión de MSLUB tras el cambio de dominio.
- Los checkpoints se eligieron con etiquetas de validación de MSLUB y los resultados de test de MSLUB ya se habían visto: no es un test confirmatorio pre-registrado.
- El DAE es un autoencoder denoising, no un modelo de difusión; ANDi es una reimplementación independiente (red más pequeña, 128x128, muchos menos pasos), por lo que sus cifras no son comparables con los resultados publicados de ANDi.
- Licencia CC BY-SA 3.0: impone compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial. IXI es CC BY-SA 3.0 y MSLUB es CC-BY; los artefactos derivados se etiquetan como CC BY-SA 3.0 por cautela, ya que no está resuelto si los pesos entrenados son adaptaciones de los datos.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de falsos positivos y falsos negativos en la detección; los propios resultados muestran que la garantía de FPR no se traduce en buen Dice en presencia de cambio de dominio.
- El coste reportado es reloj por precio de lista, no factura; el total excluye Pods de desarrollo anteriores y no mide la parte proporcional del volumen de red compartido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TamAko783/anomalies-diffusion-calibration
- Referencia metodológica: Bates et al., "Testing for outliers with conformal p-values", Annals of Statistics, 2023 (citado en la model card; sin URL en la información proporcionada)
- Referencia metodológica: Angelopoulos et al., "Conformal Risk Control", ICLR 2024 (citado en la model card; sin URL en la información proporcionada)
- Conjunto de datos IXI (CC BY-SA 3.0): sin URL en la información proporcionada
- Conjunto de datos MSLUB (CC-BY, Ljubljana): sin URL en la información proporcionada
- Detector DAE baseline: `anomalies-diffusion-dae-baseline` (referenciado en la model card; sin URL directa en la información proporcionada)
- Detector ANDi: `anomalies-diffusion-andi` (referenciado en la model card; sin URL directa en la información proporcionada)
- Artefactos de auditoría: `audit.json` (incluido en el repositorio, según la model card)
