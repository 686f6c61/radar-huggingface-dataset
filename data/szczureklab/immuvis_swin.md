# SzczurekLab/ImmuVis_Swin

## Resumen

ImmuVis Swin es un autoencoder enmascarado (masked autoencoder) basado en Swin Transformer, desarrollado por SzczurekLab para el análisis de imágenes de citometría de masas por imagen (imaging mass cytometry, IMC). Forma parte de la familia ImmuVis, un conjunto de modelos fundacionales presentados en el paper arXiv:2602.04585, cuyo objetivo es resolver un problema estructural de las imágenes multiplex: a diferencia de las imágenes naturales, el espacio de canales no es fijo, ya que cada estudio emplea un conjunto distinto de marcadores moleculares.

El modelo aborda esta variabilidad mediante una codificación compartida agnóstica al marcador, hiperkernels condicionados por marcador, un encoder pan-marcador y un decoder también condicionado por marcador. Soporta 265 marcadores definidos en el tokenizador `markers_tokenizer.yaml`, con un ancho latente de 768, y produce para cada marcador solicitado tanto logits de media como log-varianza, lo que permite estimar incertidumbre calibrada.

Es relevante porque los modelos fundacionales para imagen biomédica suelen asumir canales fijos y no generalizan entre paneles de marcadores. ImmuVis plantea una arquitectura que se adapta a conjuntos de marcadores variables y, según el paper, supera a las líneas base en tinción virtual y clasificación downstream con un coste computacional sustancialmente menor que alternativas basadas en transformer. El repositorio pesa 0,6 GB y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer con masked autoencoder; codificación agnóstica al marcador, hiperkernels condicionados por marcador, encoder pan-marcador y decoder condicionado por marcador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a este tipo de modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible explícitamente; carga mediante `MultiplexAutoencoder.from_pretrained` (PyTorch) |

## Arquitectura y entrenamiento

ImmuVis Swin es un autoencoder enmascarado construido sobre Swin Transformer, implementado en la clase `multiplex_model.modules.MultiplexAutoencoder`. La innovación central es el tratamiento de los marcadores moleculares como un espacio variable: en lugar de fijar canales de entrada, el modelo emplea una codificación compartida agnóstica al marcador combinada con hiperkernels condicionados por marcador, un encoder pan-marcador y un decoder condicionado por marcador. Esto permite entrenar y aplicar un mismo modelo sobre paneles de marcadores distintos, algo que los transformers convencionales de imagen no soportan sin reentrenamiento.

El modelo cubre 265 marcadores definidos por el tokenizador oficial y trabaja con un ancho latente de 768. El decoder emite, para cada marcador solicitado, logits de media y log-varianza, lo que corresponde a un objetivo de verosimilitud heterocedástica que proporciona incertidumbre calibrada, una capacidad que el paper destaca como exclusiva frente a las líneas base. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO, que en cualquier caso no son habituales en este dominio.

## Capacidades

- Tinción virtual (virtual staining): predice la expresión de marcadores no observados a partir de los disponibles en una muestra IMC.
- Codificación y reconstrucción de imágenes multiplex con conjuntos de marcadores variables, gracias al encoder pan-marcador y a los hiperkernels condicionados.
- Estimación de incertidumbre calibrada por marcador mediante salida de media y log-varianza (objetivo de verosimilitud heterocedástica).
- Extracción de representaciones latentes de ancho 768 para tareas downstream de clasificación sobre tejido.
- Soporte de 265 marcadores mediante un tokenizador compartido entre las variantes de la familia ImmuVis.
- No dispone de tool calling, capacidades de agente, generación de texto, código, matemáticas, visión natural ni audio.

## Casos de uso

- Tinción virtual en estudios IMC: dado un panel de marcadores adquirido, el modelo predice los marcadores ausentes, lo que permite reducir el número de canales medidos experimentalmente y abaratar la adquisición.
- Armonización de paneles entre estudios: al ser agnóstico al marcador, permite procesar cohortes con paneles distintos bajo un mismo modelo, facilitando la comparación y el análisis conjunto de datos heterogéneos.
- Clasificación de tejido downstream: las representaciones latentes de 768 dimensiones pueden alimentar clasificadores de regiones o estados patológicos, aprovechando el preentrenamiento del modelo fundacional.
- Perfilado espacial a gran escala: el modelo está pensado para profiling espacial de tejidos de alto rendimiento, donde la eficiencia computacional frente a alternativas transformer es relevante.
- Control de calidad con incertidumbre: la salida de log-varianza permite identificar predicciones poco fiables por marcador y priorizar revisión manual o repetición de la medida.
- Investigación en biología tumoral y microambiente: la caracterización multiplex de marcadores en tejido es aplicable al estudio de poblaciones celulares y su organización espacial, con la ventaja de la incertidumbre calibrada.

## Benchmarks y rendimiento

Según el resumen del paper (arXiv:2602.04585), ImmuVis supera a las líneas base y ablaciones del estado del arte en tinción virtual y en tareas de clasificación downstream, con un coste computacional sustancialmente menor que las alternativas basadas en transformer, y es el único modelo que proporciona incertidumbre calibrada mediante un objetivo de verosimilitud heterocedástica. No se han publicado en la información disponible las cifras concretas de dichos benchmarks, por lo que no se incluyen valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,6 GB, lo que sugiere un modelo de tamaño moderado, pero no se especifica el número de parámetros ni los requisitos de memoria.
- GPU recomendadas: no disponible. El paper enfatiza un coste computacional bajo frente a alternativas transformer, pero no se detallan modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la vía documentada es PyTorch mediante el paquete fuente `szczurek-lab/ImmuVis` (Python 3.12 o superior, gestión con `uv`) y la carga con `MultiplexAutoencoder.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numéricos ni de especificaciones de modelos comparables en la información proporcionada. El paper menciona comparaciones frente a "state-of-the-art baselines" en tinción virtual y clasificación, pero no se identifican por nombre ni se detallan sus parámetros, contexto o licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo específico de imagen de citometría de masas (IMC): no es aplicable a texto, código ni visión natural.
- Dependencia estricta del tokenizador oficial: el autor advierte de que debe usarse el mapeo exacto de `markers_tokenizer.yaml` y no renumerar los IDs; hacerlo invalida las predicciones.
- Cobertura limitada a 265 marcadores definidos por el tokenizador; marcadores fuera de ese conjunto no están soportados.
- Requiere instalar el paquete fuente desde GitHub (Python 3.12+); no se distribuye como pipeline estándar de Hugging Face (`pipeline: no disponible`).
- Riesgo de alucinación: no aplica en el sentido de texto, pero la tinción virtual puede generar predicciones plausibles y erróneas; la incertidumbre calibrada debe usarse para filtrar resultados, no como garantía.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos derivados de la distribución de tejidos, paneles y protocolos de adquisición del dataset de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento y del tokenizador compartido.
- Sin datos publicados de benchmarks numéricos, latencia ni requisitos de memoria en la información disponible, lo que dificulta una evaluación cuantitativa previa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SzczurekLab/ImmuVis_Swin
- Repositorio de código: https://github.com/szczurek-lab/ImmuVis
- Paper (arXiv): https://arxiv.org/abs/2602.04585
- PDF del paper: https://arxiv.org/pdf/2602.04585
- Logo del modelo: https://huggingface.co/SzczurekLab/ImmuVis_Swin/resolve/main/imgs/immuvis_logo.png
