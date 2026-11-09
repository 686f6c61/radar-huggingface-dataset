# Tony1233/EvoTCR-Refill212-MLP

## Resumen
EvoTCR-Refill212-MLP es un modelo de factorización y regresión orientado a la predicción de interacciones TCR-pMHC (receptor de células T frente a complejo péptido-MHC), publicado por el usuario Tony1233 en Hugging Face. No es un modelo de lenguaje: se trata de un conjunto de parámetros de inferencia congelados que combinan 17 factores (referencia de entrenamiento, PCA, centros de kernel y coeficientes de regresión) con cinco cabezas MLP. El repositorio ocupa 0,1 GB y se distribuye en formato PyTorch.

El modelo resuelve un problema muy acotado: puntuar, dentro de un panel fijo de 20 dianas y 2 alelos HLA, la afinidad relativa de cada TCR frente a un conjunto de 10 péptidos del mismo HLA. La salida es una puntuación relativa dentro del panel (softmax intragrupo calibrado con la desviación típica de las puntuaciones de entrenamiento), no una probabilidad de unión calibrada experimentalmente. Es relevante para investigadores que trabajan en inmunología computacional y quieran reproducir o reutilizar la metodología de factorización del proyecto EvoTCR.

La arquitectura MLP es extremadamente compacta: 34 entradas (17 valores sigmoideos más 17 rankings del mismo TCR frente a los diez péptidos), 8 unidades de ancho y 3 capas con activación SiLU, lo que suma 467 parámetros entrenables. El modelo se entrenó con 60 épocas sobre la configuración 77 seleccionada internamente, con cinco semillas predefinidas (1109-1113) y el modelo principal en la semilla 1109.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Factor model (17 factores) + 5 cabezas MLP; MLP de 34 entradas, 8 de ancho, 3 capas SiLU |
| Parametros totales | 467 parametros entrenables en el MLP; parametros de inferencia congelados de los 17 factores (recuento total no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); entrada limitada a un panel de 10 peptidos por TCR y HLA |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | zh (chino) en la metadata; el modelo no procesa lenguaje natural |
| Licencia | alphafold3-output-terms (AlphaFold 3 Output Terms of Use); el codigo del repositorio asociado es MIT |
| Formato de pesos | PyTorch (pytorch); float32 |

## Arquitectura y entrenamiento
El modelo combina un modelo de factores con un MLP. Los 17 factores incluyen la referencia de entrenamiento, componentes PCA, centros de kernel y coeficientes de regresión, todos congelados en float32. La cabeza MLP recibe 34 entradas: los 17 valores sigmoideos de los factores y los 17 rankings del mismo TCR frente a los diez péptidos del panel. La red tiene 8 unidades de ancho y 3 capas con activación SiLU, con 467 parámetros entrenables, y produce una softmax intragrupo calibrada con la desviación típica de las puntuaciones de entrenamiento.

El entrenamiento se realizó sobre el dataset Tony1233/EvoTCR-1000-Refill212 con 60 épocas y la configuración 77, seleccionada internamente según la puntuación de validación interna (0,74860244), que no debe confundirse con la puntuación de test externa. Las etiquetas de entrenamiento son coincidencias de diseño computacional y desajustes asumidos, no mediciones experimentales. Todos los parámetros ajustables se determinaron exclusivamente con estos datos de entrenamiento, sin reutilizar ajustes previos; el protocolo de ajuste, la selección de modelo y el manifiesto SHA256 completo se registran en `SELECTED_MODEL.json` y `PROTOCOL.json`. El autor declara comprobaciones de replay independiente e invariancia a lote y permutación.

## Capacidades
- Predicción de puntuaciones relativas de interacción TCR-pMHC dentro de un panel fijo de 20 dianas y 2 alelos HLA.
- Puntuación de paneles completos de 10 péptidos del mismo HLA por cada TCR.
- Ranking intragrupo de péptidos para un TCR dado mediante softmax calibrada.
- Reproducibilidad determinista con cinco semillas predefinidas (1109-1113) y modelo principal en 1109.
- Replay independiente y verificación de invariancia a lote y permutación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No es un predictor zero-shot generalizable a péptidos o HLA nuevos.

## Casos de uso
- Reproducción de experimentos de inmunología computacional: el modelo permite replicar exactamente las puntuaciones publicadas gracias a los parámetros congelados en float32 y a los ficheros `SELECTED_MODEL.json` y `PROTOCOL.json`, que documentan el protocolo de ajuste completo.
- Evaluación comparativa de metodologías TCR-pMHC: sirve como referencia compacta (467 parámetros en el MLP) para contrastar enfoques de factorización frente a modelos más pesados en el mismo panel de 20 dianas y 2 HLA.
- Análisis de ranking de péptidos dentro de un panel: para un TCR concreto, el modelo ordena los 10 péptidos del mismo HLA según su puntuación relativa, útil para priorizar candidatos en cribados computacionales.
- Validación de pipelines de datos: la invariancia a lote y permutación declarada permite usar el modelo como test de integridad en pipelines que procesan paneles de TCR-pMHC.
- Estudio de calibración de puntuaciones: la softmax intragrupo calibrada con la desviación típica de entrenamiento es un caso de estudio para analizar cómo se comportan scores relativos frente a probabilidades calibradas experimentalmente.
- Docencia e investigación metodológica: por su tamaño reducido y su documentación de protocolo, es adecuado para ilustrar el flujo completo de factorización, selección de configuración y evaluación con pAUC estandarizada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| IMMREP2025 macro standardized pAUC (max_fpr=0.1), media 5 seeds | 0,64662456 ± 0,00278481 (desviacion tipica muestral) |
| IMMREP2025 macro standardized pAUC, mejor seed individual | 0,64843275 |
| Puntuacion de seleccion interna (no es test externo) | 0,74860244 |

El autor advierte que los factores historicos y el proceso de generacion estuvieron expuestos a IMMREP2025, por lo que la evaluacion no constituye un test ciego completamente nuevo.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB y los pesos estan en float32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es mas que suficiente. A100 o H100 no aportan ventaja relevante para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier modelo con al menos 1 GB de memoria.
- Opciones de despliegue: PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvoTCR-Refill212-MLP | 467 en MLP + factores congelados | Panel fijo de 10 peptidos, 20 dianas, 2 HLA | pAUC IMMREP2025 0,6466 ± 0,0028 (5 seeds) | alphafold3-output-terms | Hugging Face (Tony1233/EvoTCR-Refill212-MLP) |
| NetTCRFold 1.0 | no disponible | no disponible | no disponible | no disponible | GitHub (mnielLab/NetTCRfold-1.0) |
| AlphaFold 3 | no disponible | no disponible | no disponible | AlphaFold 3 Output Terms of Use | Google DeepMind |

No se dispone de datos de rendimiento de NetTCRFold ni de AlphaFold 3 en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- El modelo no es un predictor zero-shot general: solo es valido para el panel fijo de 20 dianas y 2 alelos HLA con el que fue entrenado.
- Requiere como entrada paneles completos de 10 péptidos del mismo HLA por cada TCR; no admite consultas arbitrarias de péptidos o HLA nuevos.
- No realiza ordenacion global entre TCRs de consultas distintas; solo hay ranking y softmax dentro del grupo.
- Las salidas son puntuaciones relativas dentro del panel, no probabilidades de union calibradas con experimentos de laboratorio.
- Las etiquetas de entrenamiento son coincidencias de diseno computacional y desajustes asumidos, no mediciones experimentales.
- La evaluacion en IMMREP2025 no es un test ciego completamente nuevo, ya que los factores historicos y el proceso de generacion estuvieron expuestos a ese conjunto.
- La licencia AlphaFold 3 Output Terms of Use restringe el uso; el MIT del repositorio de codigo no sustituye las condiciones de los datos, parametros derivados ni software upstream. Solo se permite para fines de investigacion permitidos por dichos terminos.
- No se ofrece garantia de validez clinica.
- No se han documentado sesgos especificos; el modelo no procesa lenguaje natural ni datos demograficos.
- Riesgo de alucinacion no aplicable en el sentido habitual, pero si de extrapolacion indebida a paneles o condiciones fuera de dominio.

## Enlaces
- Hugging Face: https://huggingface.co/Tony1233/EvoTCR-Refill212-MLP
- Dataset: https://huggingface.co/datasets/Tony1233/EvoTCR-1000-Refill212
- Codigo EvoTCR: https://github.com/JinQingshuo/EvoTCR
- AlphaFold 3 Output Terms of Use: https://github.com/google-deepmind/alphafold3/blob/main/OUTPUT_TERMS_OF_USE.md
- Paper AlphaFold 3: https://doi.org/10.1038/s41586-024-07487-w
- NetTCRFold: https://github.com/mnielLab/NetTCRfold-1.0
