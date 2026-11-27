# zubairH123/boroughdrive-nyc-eta

## Resumen

BoroughDrive NYC ETA es un modelo de regresión tabular basado en árboles con gradient boosting, entrenado con scikit-learn, que predice el tiempo de viaje (en segundos) de una flota de vehículos en la ciudad de Nueva York. Lo desarrolla Syed Zubair Hussain Shah (usuario `zubairH123`) como componente del sistema BoroughSignal, un rastreador de flota escrito en Rust. No es un modelo de lenguaje: es un artefacto predictivo ligero que se distribuye como JSON portable con umbrales de división, hojas, orden de características e intercepto, pensado para ser evaluado directamente desde Rust o Python.

El modelo resuelve un problema acotado: estimar el tiempo de llegada (ETA) a partir de siete características conocidas antes de la salida del viaje (distancia en metros, número de tramos de carretera, hora local de salida, día de la semana, código meteorológico, congestión entre 0 y 1 y código de distrito). Se entrenó sobre 4.206 viajes y se evaluó sobre 875 viajes de test con separación temporal, todo ello a partir de un conjunto de datos sintético publicado por el mismo autor.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de pipeline de regresión tabular con artefacto portable y pruebas de paridad, no como modelo de propósito general. El autor advierte explícitamente de que las métricas miden el rendimiento dentro del simulador y de que un despliegue real de flota requeriría etiquetas de viajes reales y una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (scikit-learn), serializado como JSON portable |
| Parametros totales | no disponible (artefacto de árboles; número de hojas y profundidad no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular de 7 características de entrada) |
| Tipos de cuantizacion | no disponible (no procede; el artefacto es JSON de parámetros de árbol) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 para el artefacto del modelo; `inference.py` bajo licencia MIT |
| Formato de pesos | JSON (`eta-model.json`), más `metrics.json`, `parity-fixture.json` e `inference.py` |

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles de decisión con gradient boosting implementado en scikit-learn. La salida es una regresión sobre segundos transcurridos de viaje, con siete características de entrada en un orden fijo: distancia en metros, número de tramos de carretera, hora de salida en hora local de Nueva York, día de la semana (lunes = 0), código meteorológico, nivel de congestión (0 a 1) y código de distrito. El artefacto publicado contiene los umbrales de división, las hojas, el orden de las características y el intercepto, lo que permite reimplementar la inferencia sin dependencia de scikit-learn.

El entrenamiento se realizó sobre 4.206 viajes y la evaluación sobre 875 viajes de test con separación temporal, según el manifiesto del dataset `zubairH123/boroughdrive-nyc-fleet-gps-eta`. Los datos son sintéticos y el propio autor indica que la variable objetivo está relacionada por diseño con la distancia, el clima y la congestión, por lo que las métricas reflejan el comportamiento dentro del simulador. No se documentan detalles de búsqueda de hiperparámetros, número de árboles, profundidad máxima ni función de pérdida más allá de las métricas MAE y RMSE declaradas. El repositorio incluye un cuaderno ejecutado y un informe de benchmarks medidos, con verificación de los fragmentos de datos y de la separación temporal.

## Capacidades

- Regresión tabular: predice segundos de viaje a partir de siete variables numéricas y categóricas codificadas.
- Inferencia portable: el JSON de parámetros permite evaluar el modelo en Rust (integración con BoroughSignal) o en Python mediante `inference.py`.
- Verificación de paridad: incluye `parity-fixture.json` con 32 salidas esperadas para validar implementaciones alternativas.
- Reproducibilidad: cuaderno ejecutado, informe de benchmarks en JSON y CSV, y flujo de publicación mediante GitHub Actions con credenciales OIDC de corta duración.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Estimación de ETA en un rastreador de flota: el modelo se integra en el componente Rust de BoroughSignal para calcular el tiempo de llegada de un vehículo antes de iniciar el trayecto, usando únicamente variables disponibles en el momento de la salida.
- Simulación y planificación de rutas: al ser un artefacto JSON ligero, puede embeberse en simuladores de tráfico para generar ETAs de referencia sin infraestructura de servidor.
- Validación de implementaciones alternativas: `parity-fixture.json` permite comprobar que una reimplementación en Rust, C++ o Go reproduce exactamente las 32 salidas esperadas del modelo original.
- Docencia y demostración de pipelines de regresión tabular: el cuaderno ejecutado y el informe de benchmarks sirven como ejemplo completo de separación temporal, comparación con línea base y publicación reproducible.
- Prototipado de sistemas de logística urbana: útil para maquetar la lógica de negocio de una aplicación de reparto antes de disponer de datos reales etiquetados.
- Comparación con líneas base sencillas: el modelo supera a la mediana histórica por ruta en el simulador, por lo que puede emplearse como referencia mínima frente a la que evaluar modelos posteriores entrenados con datos reales.

## Benchmarks y rendimiento

Evaluación sobre 875 viajes de test con separación temporal, según la model card:

| Modelo | MAE | RMSE | Error absoluto P90 |
|---|---:|---:|---:|
| Mediana histórica por ruta | 28,67 s | 40,05 s | 62,00 s |
| BoroughSignal (este modelo) | 14,89 s | 21,08 s | 32,03 s |

Estos resultados proceden de datos sintéticos y miden la predicción dentro del simulador. El autor indica explícitamente que no constituyen una medida de precisión en producción ni una afirmación de aceleración por GPU.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un conjunto de árboles serializado en JSON y se ejecuta en CPU.
- GPU recomendadas: no aplica; el cuaderno incluye una sección CUDA opcional que se omite en ejecutores solo-CPU, sin que se documenten ganancias de rendimiento.
- GPU de consumo: irrelevante para la inferencia; cualquier CPU moderna es suficiente.
- Opciones de despliegue: inferencia directa en Rust dentro de BoroughSignal, o mediante `inference.py` con Python; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el cuaderno guarda tiempos de entrenamiento y predicción medidos, pero la model card no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Métrica en su evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoroughDrive NYC ETA | Gradient boosting (scikit-learn), JSON portable | 7 características tabulares | MAE 14,89 s (datos sintéticos) | CC BY 4.0 (artefacto), MIT (`inference.py`) | Hugging Face, GitHub |
| Mediana histórica por ruta | Línea base estadística | Ruta | MAE 28,67 s (datos sintéticos) | no aplica | Referencia interna del cuaderno |
| Otros modelos de ETA urbana | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: la variable objetivo está relacionada por diseño con la distancia, el clima y la congestión, por lo que las métricas no extrapolan a tráfico real.
- El autor advierte de que un despliegue real de flota requeriría etiquetas de viajes reales y una evaluación separada.
- Cobertura geográfica limitada a la ciudad de Nueva York y a los códigos de distrito, clima y congestión definidos en el dataset.
- No procesa texto ni lenguaje natural; no sirve para tareas de NLP, visión, código o razonamiento.
- Sin datos publicados sobre sesgos, calibración por distrito ni comportamiento en condiciones meteorológicas extremas.
- La licencia CC BY 4.0 exige atribución al autor (Syed Zubair Hussain Shah) en usos derivados; `inference.py` se distribuye bajo MIT, con un ámbito distinto que se detalla en `LICENSE-DATA.md`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.
- La imagen promocional corresponde a una marca anterior (BoroughSignal) y no es una captura de la demo actual, según aclara el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zubairH123/boroughdrive-nyc-eta
- Dataset: https://huggingface.co/datasets/zubairH123/boroughdrive-nyc-fleet-gps-eta
- Demo en vivo: https://zubair-hussain.github.io/BoroughDrive/
- Vídeo: https://zubair-hussain.github.io/BoroughDrive/watch.html
- Repositorio fuente: https://github.com/Zubair-hussain/BoroughDrive
- Cuaderno ejecutado: https://huggingface.co/zubairH123/boroughdrive-nyc-eta/blob/main/notebook.ipynb
- Ejecutar en Colab: https://huggingface.co/zubairH123/boroughdrive-nyc-eta/colab
- Informe de benchmarks: https://huggingface.co/zubairH123/boroughdrive-nyc-eta/blob/main/benchmarks.json
- Tabla CSV de benchmarks: https://huggingface.co/zubairH123/boroughdrive-nyc-eta/blob/main/benchmark-table.csv
- Instrucciones de publicación: https://huggingface.co/zubairH123/boroughdrive-nyc-eta/blob/main/PUBLISHING.md
- Sitio del autor: https://zubairhussain.xyz/
