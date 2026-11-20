# WilliamQiu123/echo-view-routing

## Resumen

echo-view-routing (`C2_ens_v1`) es un sistema de clasificación y segmentación temporal de vistas en ecocardiografía, desarrollado por WilliamQiu123 y publicado bajo la licencia académica de Cedars-Sinai. El modelo recibe una grabación de ecocardiograma y asigna una de cinco vistas (PLAX, PSAX, A4C, A5C o SC4C); para flujos más largos que concatenan varias grabaciones, además detecta los puntos de cambio entre vistas. Resuelve un problema de enrutamiento previo al análisis clínico: etiquetar automáticamente qué vista contiene cada fragmento de un estudio ecocardiográfico.

Técnicamente es un modelo de clasificación de vídeo basado en MViTv2-S de torchvision, con una proyección de 512 dimensiones, un segundo stem de entrada que marca el fotograma solicitado y una cabeza lineal de cinco clases, con 34,6 millones de parámetros. Se despliega como un ensemble de tres semillas entrenadas de forma independiente cuyas probabilidades se promedian. El modelo opera sobre ventanas de 16 fotogramas (1,6 s) a 10 fps, con una predicción cada 0,5 s, y una segmentación de flujo mediante un decodificador de change-point basado en divergencia Jensen-Shannon.

Es relevante porque parte del encoder de vídeo EchoPrime y añade una etapa de aumento de datos agresivo (zoom, desplazamiento, rotación, mapas de niveles de gris, ganancia, desenfoque, ruido y bordes) que mejora la generalización entre fabricantes: el modelo se entrena solo con datos de Philips y se evalúa con datos de GE. No se usó MIMIC-IV-Echo para entrenar la red, solo para decisiones de receta y de ensamblado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MViTv2-S (torchvision) con proyección 512-d, segundo stem de entrada y cabeza lineal de 5 clases; ensemble de 3 semillas |
| Parametros totales | 34,6 millones por red (ensemble de 3 redes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 16 fotogramas (1,6 s) a 10 fps; predicción cada 0,5 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen médica, sin procesamiento de lenguaje) |
| Licencia | cedars-sinai-academic-software-license (solo investigación académica y sin ánimo de lucro) |
| Formato de pesos | safetensors |
| Entrada | vídeo a 10 fps, lado corto redimensionado a 256 px, recorte central 224 × 224, escala de grises, sin enmascarado ni corrección de intensidad |
| Clases de salida | PLAX, PSAX, A4C, A5C, SC4C |
| Dataset de entrenamiento | split de entrenamiento de EV9V: 3.364 grabaciones de un hospital, máquinas Philips |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

La red es un encoder de vídeo MViTv2-S de torchvision con una proyección a 512 dimensiones y una cabeza lineal de cinco clases. Cada predicción consume 16 fotogramas consecutivos (1,6 s) centrados en el instante solicitado, y un segundo stem de entrada marca explícitamente el fotograma de referencia. La vista de una grabación completa se obtiene promediando las probabilidades de ventana y tomando la clase con mayor probabilidad. Para la segmentación de flujos, cada muestra a 0,1 s toma la probabilidad de la ventana más cercana y un decodificador de change-point corta donde la divergencia Jensen-Shannon entre 0,7 s a cada lado supera el umbral 0,1738 (configurado en `decoder.json`).

El entrenamiento parte del encoder de vídeo publicado de EchoPrime y se organiza en tres etapas sobre el split de entrenamiento de EV9V (3.364 grabaciones de un único hospital con máquinas Philips). La etapa 1 entrena el modelo de ventana con entropía cruzada; la etapa 2 añade una penalización de suavizado entre ventanas vecinas (truncated log-probability smoothing de MS-TCN, peso 0,15); la etapa 3 continúa 1.500 actualizaciones con el mismo objetivo y un aumento de entrada agresivo (zoom, desplazamiento, rotación, mapas de niveles de gris, ganancia, desenfoque, ruido y bordes). Según el autor, la etapa 3 es la que hace usable el modelo con grabaciones de otro fabricante. No se usó ningún registro de MIMIC-IV-Echo, etiquetado o no, para entrenar la red; los datos de MIMIC se emplearon, con etiquetas de otro clasificador, para elegir entre recetas de entrenamiento (372 pacientes) y para decidir el ensamblado de las tres semillas (866 pacientes adicionales).

## Capacidades

- Clasificación de vista en ecocardiografía entre cinco clases: PLAX, PSAX, A4C, A5C y SC4C.
- Salida de probabilidad por clase y medida de acuerdo entre las tres semillas del ensemble.
- Segmentación temporal de flujos largos: detecta dónde acaba una vista y empieza la siguiente, con marcas de inicio, fin, vista y probabilidad media.
- Lectura de DICOM cine, archivos de vídeo o carpetas de fotogramas mediante `echoview.read_recording`.
- Procesamiento en escala de grises a 10 fps con recorte central 224 × 224, sin enmascarado ni corrección de intensidad.
- Verificación de integridad de los pesos mediante SHA-256 antes de considerarlos el sistema de referencia.
- Herramientas de línea de comandos: `echoview selfcheck`, `echoview classify`, `echoview segment` y `echoview evaluate`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.

## Casos de uso

- Enrutamiento previo al análisis clínico: clasificar cada grabación de un estudio ecocardiográfico por vista antes de pasarla a los módulos de medida o de interpretación, evitando que un pipeline reciba una vista que no espera.
- Segmentación de estudios concatenados: dividir un flujo que une varias grabaciones de una misma exploración en fragmentos por vista, usando el decodificador de change-point con umbral 0,1738.
- Control de calidad de adquisiciones: detectar grabaciones cuya vista asignada tiene baja probabilidad o bajo acuerdo entre semillas y marcarlas para revisión manual.
- Indexación y búsqueda de archivos ecocardiográficos: etiquetar automáticamente grandes volúmenes de grabaciones para permitir búsquedas por vista (por ejemplo, recuperar todos los A4C de una cohorte).
- Investigación retrospectiva: filtrar cohortes por vista en estudios observacionales, con la salvedad de que la licencia restringe el uso a investigación académica y sin ánimo de lucro.
- Validación cruzada entre fabricantes: usar el modelo, entrenado solo con máquinas Philips, para etiquetar grabaciones de GE u otros fabricantes en tareas de armonización de datos.
- Preetiquetado para anotación: generar etiquetas de vista y segmentos como punto de partida para que un experto las revise, reduciendo el coste de anotación.

## Benchmarks y rendimiento

| Datos | Medida | Resultado |
|---|---|---|
| EV9V, mitades de desarrollo, flujos construidos con grabaciones etiquetadas | F1 de segmentación con solapamiento al 50%, mitad de selección | 0,959 |
| EV9V, mitades de desarrollo, flujos construidos con grabaciones etiquetadas | F1 de segmentación con solapamiento al 50%, mitad de calibración | 0,984 |
| EV9V, benchmark de test congelado, 120 flujos de 4 a 8 fragmentos | F1 de segmentación con solapamiento al 50% | 0,909 (IC 95%: 0,883–0,934) |
| EV9V, benchmark de test congelado, 800 grabaciones individuales | exactitud y macro-F1 | 98,1% y 0,956 |
| MIMIC-IV-Echo, 9.341 grabaciones de 1.001 pacientes (máquinas GE) | coincidencia con la tabla de otro clasificador, media sobre PLAX_LV, PSAX_non_zAV y A4C_general | 95,8% (95,2–96,3) |
| MIMIC-IV-Echo, 1.139 flujos de 988 pacientes | F1 de segmentación con solapamiento al 50% frente a esa tabla | 0,882 (0,870–0,894) |
| MIMIC-IV-Echo, flujos, contando A5C como A4C | F1 de segmentación con solapamiento al 50% | 0,935 (0,925–0,943) |

Advertencias del autor sobre estas cifras: las filas de MIMIC miden acuerdo entre dos modelos, no exactitud, porque MIMIC-IV-Echo no tiene etiquetas de vista de un lector y la referencia es la salida de otro clasificador que no tiene clases A5C ni SC4C. Los pacientes de MIMIC de esas filas no participaron en la formación del sistema, y un ensemble mayor de seis modelos puntuó 0,009 más en flujos, pero el proyecto mantuvo el de tres semillas. El benchmark de test de EV9V no está intacto: rondas anteriores del proyecto se evaluaron sobre él. El acuerdo con MIMIC descansa en el aumento de la etapa 3: en 8.033 grabaciones de 866 pacientes distintos de MIMIC, el modelo de etapa 2 coincidió con el otro clasificador en el 84,7% y las semillas individuales de etapa 3 en el 94,6%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 34,6 millones de parámetros por red y tres redes en el ensemble, el peso en precisión completa ronda los 400 MB, pero el consumo real depende del tamaño de lote y del pipeline de vídeo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del modelo es probable que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: paquete `echoview` instalable desde `git+https://github.com/WilliamQiuzy/echo-view-routing`, con API de Python (`echoview.load`, `classify`, `segment`) y CLI (`echoview classify`, `echoview segment`, `echoview selfcheck`, `echoview evaluate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Verificación de integridad: el código comprueba cada archivo de pesos contra su SHA-256 antes de declarar el resultado como sistema de referencia.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| echo-view-routing (C2_ens_v1) | Clasificación de vista y segmentación temporal en ecocardiografía | 34,6 M por red (ensemble de 3) | 16 fotogramas (1,6 s) a 10 fps | Cedars-Sinai Academic Software License | Pesos en Hugging Face, código en GitHub |
| EchoPrime (encoder base) | Codificación de vídeo ecocardiográfico para múltiples tareas | no disponible | no disponible | EchoPrime Academic Software License | Pesos publicados por el proyecto EchoPrime |
| Clasificador de vista de referencia de MIMIC-IV-Echo | Clasificación de vista (PLAX_LV, PSAX_non_zAV, A4C_general) | no disponible | no disponible | no disponible | Usado como referencia en la evaluación del autor; no se detalla su disponibilidad |

No se dispone de datos suficientes para comparar rendimiento numérico con alternativas de la misma categoría; la única comparación publicada es la del propio autor contra el clasificador de referencia de MIMIC-IV-Echo, en términos de acuerdo entre modelos y no de exactitud.

## Limitaciones y advertencias

- Licencia restrictiva: Cedars-Sinai Academic Software License, solo para investigación académica y sin ánimo de lucro; el uso comercial no está permitido.
- Los pesos derivan del encoder de EchoPrime y heredan su licencia académica.
- El modelo se entrenó únicamente con 3.364 grabaciones de un solo hospital y máquinas Philips; la generalización a otros fabricantes depende del aumento de la etapa 3 y se midió solo como acuerdo con otro clasificador, no contra lectores humanos.
- Las cifras de MIMIC-IV-Echo no son exactitud: son acuerdo con la salida de otro clasificador que carece de las clases A5C y SC4C, por lo que la evaluación de esas dos clases en datos de GE es limitada.
- El benchmark de test de EV9V se usó en rondas anteriores del proyecto, por lo que no es un conjunto intacto.
- Riesgo de alucinación en el sentido de asignar una vista con alta confianza a una grabación ambigua o de baja calidad; el autor expone la probabilidad y el acuerdo entre semillas, que conviene revisar.
- Sin datos publicados sobre sesgos demográficos, de fabricante o de protocolo de adquisición más allá de la comparación Philips–GE.
- No procesa texto ni lenguaje: los campos de idiomas y de capacidades multilingües no aplican.
- No hay información sobre cuantización, latencia, throughput ni requisitos de VRAM, lo que dificulta planificar despliegues en producción.
- La reproducibilidad está acotada: `echoview evaluate` reproduce exactamente la fila de desarrollo, pero el autor indica que los logits difieren de los del código de investigación en la comparación del 2026-11-17.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WilliamQiu123/echo-view-routing
- Código: https://github.com/WilliamQiuzy/echo-view-routing
- Licencia (EchoPrime): https://github.com/echonet/EchoPrime/blob/main/LICENSE
- Dataset EV9V: https://huggingface.co/datasets/bgx666/EV9V
