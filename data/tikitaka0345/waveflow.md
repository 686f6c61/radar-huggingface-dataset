# tikitaka0345/WaveFlow

## Resumen

WaveFlow es un conjunto de tres modelos de predicción de oleaje oceánico y niveles de agua desarrollados por tikitaka0345 y publicados junto al manuscrito "WaveFlow enables high-resolution prediction of ocean waves and water levels for coastal hazard warning". A diferencia de los modelos de lenguaje, WaveFlow es un modelo científico de dominio específico que opera sobre mallas no estructuradas y emplea flow matching para generar predicciones de alta resolución de variables oceanográficas como altura significativa de ola (Hs), periodo de pico (Tp), dirección media (Dm) y elevación del nivel del agua.

El repositorio incluye tres variantes con distintos ámbitos geográficos y complejidad: un modelo regional para Hong Kong con cuatro variables (45,69 M de parámetros), un modelo de malla global solo para Hs (465,46 M de parámetros) y un modelo global con las cuatro variables (966,04 M de parámetros). Los pesos se distribuyen en formato PyTorch (.pt) con pesos EMA ya integrados en el state dict.

La relevancia del modelo radica en su aplicación a la alerta temprana de peligros costeros: la predicción de alta resolución de oleaje y niveles de agua es crítica para la gestión de inundaciones, sobrevertido (overtopping) y seguridad costera. El modelo se publica con licencia CC BY 4.0 para pesos y datos de figuras, y MIT para el código, lo que facilita su reutilización en investigación y operación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre malla no estructurada (unstructured mesh) |
| Parametros totales | 45,69 M (HK 4var) / 465,46 M (global Hs) / 966,04 M (global 4var) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (documentación y metadatos) |
| Licencia | CC BY 4.0 (pesos y datos de figuras); MIT (código) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

WaveFlow emplea una arquitectura basada en flow matching que opera directamente sobre mallas no estructuradas, lo que permite resolver la geometría irregular de dominios oceánicos y costeros sin necesidad de regrillar a mallas regulares. El modelo genera predicciones de alta resolución de variables oceanográficas mediante un proceso de transporte continuo entre distribuciones, adecuado para campos espaciales complejos como el oleaje.

Se publican tres checkpoints entrenados con distintos ámbitos y objetivos: el modelo regional de Hong Kong con cuatro variables (Hs, Tp, Dm, elev) entrenado hasta la época 49; el modelo global solo para Hs hasta la época 99; y el modelo global con cuatro variables hasta la época 199. Todos los checkpoints almacenan los pesos EMA integrados en `model_state_dict`, con los buffers no EMA preservados de la ejecución original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de altura significativa de ola (Hs) a escala regional (Hong Kong) y global.
- Predicción conjunta de cuatro variables oceanográficas: Hs, periodo de pico (Tp), dirección media (Dm) y elevación del nivel del agua (elev).
- Operación sobre mallas no estructuradas, adaptándose a geometrías costeras irregulares.
- Generación de campos de alta resolución para alerta de peligros costeros (inundación, sobrevertido).
- Reproducción de resultados científicos mediante scripts y datos de figuras incluidos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidades multilingües no aplicables; la documentación está en inglés.

## Casos de uso

- Alerta temprana de peligros costeros en Hong Kong: el modelo regional de cuatro variables (45,69 M de parámetros) permite predecir Hs, Tp, Dm y elevación del nivel del agua en la malla costera de Hong Kong, adecuado para sistemas de aviso de inundación y sobrevertido en tiempo casi real.
- Predicción global de oleaje: el modelo global solo Hs (465,46 M de parámetros) genera campos de altura significativa de ola a escala planetaria sobre malla no estructurada, útil para asimilación en modelos operacionales y estudios climáticos.
- Predicción global multivariable: el modelo global de cuatro variables (966,04 M de parámetros) proporciona campos conjuntos de oleaje y nivel del agua para análisis de peligros compuestos en costas expuestas.
- Evaluación de sobrevertido (overtopping): los datos de figuras incluyen activos de Ragasa 2025 sobre sobrevertido costero, lo que permite validar el modelo frente a eventos reales de rebase.
- Investigación en dinámica oceánica: la arquitectura de flow matching sobre malla no estructurada sirve como base para experimentos de predicción de campos espaciales complejos en oceanografía.
- Reproducibilidad científica: los scripts `reproduce/reproduce.py` permiten regenerar las figuras del manuscrito (fig2a, etc.) a partir de los pesos y datos publicados, facilitando la verificación independiente.
- Integración en pipelines de investigación con ERA5: los recortes de ERA5 incluidos en los datos de figuras permiten entrenar y evaluar variantes del modelo con datos reanálisis abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint más pequeño (HK 4var, 183,1 MB) cabe holgadamente en cualquier GPU consumer con 4 GB o más; el global Hs (1.881,0 MB) requiere aproximadamente 4-6 GB en FP32; el global 4var (3.883,3 MB) requiere aproximadamente 8-10 GB en FP32.
- GPU recomendadas: RTX 3060/4060 o superiores para el modelo regional; RTX 4090, A100 o H100 para los modelos globales con margen para lotes grandes.
- Cabe en GPU consumer: sí, los tres checkpoints caben en GPUs consumer de gama media-alta (8-16 GB), especialmente el regional y el global Hs.
- Opciones de despliegue: PyTorch nativo con el entorno conda proporcionado (`environment.yml`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este dominio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (predicción de oleaje mediante flow matching sobre malla no estructurada) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP (MMLU, HumanEval, GSM8K).
- Cobertura geográfica limitada: el modelo regional solo cubre Hong Kong; los modelos globales cubren la malla global pero con las limitaciones de resolución de la malla de entrenamiento.
- Dependencia de datos de entrada: requiere las coordenadas de malla, clusters de parches y estadísticas de normalización incluidas en `assets.tar.gz`; sin ellos los pesos no son utilizables.
- Los campos de referencia de hindcast necesarios para las figuras 5g–i, ED Fig. 5 y ED Fig. 6 son un producto de terceros y no se redistribuyen; el usuario debe obtenerlos por su cuenta según `DATA.md`.
- Riesgo de alucinación no aplicable en el sentido de NLP, pero sí existe riesgo de predicciones no físicas fuera del dominio de entrenamiento (extrapolación a regímenes oceanográficos no vistos).
- Licencia CC BY 4.0 permite uso comercial con atribución, pero los activos de terceros en el archivo de figuras conservan sus propias licencias (ver `THIRD_PARTY.md`).
- Los pesos EMA están integrados en `model_state_dict`; cargarlos requiere desactivar EMA en la configuración (`use_ema=false`, `use_ema_for_sampling=false`), lo que puede inducir errores si no se sigue la instrucción.
- No se documentan sesgos conocidos en la información disponible; al ser un modelo físico, los sesgos dependerían de la distribución del dataset de entrenamiento, no especificada.

## Enlaces

- Hugging Face: https://huggingface.co/tikitaka0345/WaveFlow
- Repositorio de código y reproducción: https://github.com/Leroy-Xiong/WaveFlow
- DOI Zenodo: https://doi.org/10.5281/zenodo.24106732
- Manuscrito asociado: "WaveFlow enables high-resolution prediction of ocean waves and water levels for coastal hazard warning" (referenciado en la model card, sin URL directa disponible)
