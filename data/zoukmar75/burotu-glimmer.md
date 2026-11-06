# zoukmar75/burotu-glimmer

## Resumen

Burotu Glimmer es un adaptador PEFT (QLoRA de rango 16 más un módulo de proyección de metilación) que enseña al modelo base Muse Glimmer 30B de Meta a interpretar perfiles de metilación de ADN libre circulante (cfDNA) para inferir el tejido de origen de un tumor. Lo desarrolla zoukmar75 en el contexto del Meta Global AI Developer Hackathon de 2026 y se publica bajo licencia Apache 2.0. El repositorio contiene únicamente los pesos entrenables (0,9 GB); el modelo base debe descargarse por separado desde `meta-models/Muse-Glimmer-30B` en revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68` y cuantizarse a 4 bits nf4.

El problema que aborda es la clasificación de tejido de origen a partir de biopsia líquida: en lugar de introducir en el prompt una matriz de miles de valores de metilación, un adaptador comprime 3.148 sitios CpG en 16 soft tokens que el LLM procesa como si fueran tokens normales. El entrenamiento se realizó en dos fases sobre plasma simulado (tumores TCGA mezclados con sangre sana), y el autor lo etiqueta explícitamente como prototipo de investigación, no como dispositivo médico.

Es relevante por dos motivos: demuestra un patrón de integración de datos ómicos en un LLM mediante soft tokens, y publica métricas de recuperación del tejido de origen en función de la fracción de ADN tumoral en plasma, un régimen donde los métodos clínicos convencionales tienen dificultades. No hay información sobre arquitectura interna del modelo base, idiomas soportados ni benchmarks de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer (modelo base Muse Glimmer 30B); incluye módulo de proyección CpG a soft tokens y pesos QLoRA de rango 16 |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "30B" (cifra no verificada en la información disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base se carga en 4 bits nf4; el adaptador se distribuye en `trainable.pt` (adaptador + LoRA) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `trainable.pt` (PyTorch), más `serving.json`, `mu.npy` y `report.json` como artefactos auxiliares; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador consta de dos componentes acoplados. El primero es un proyector que transforma un vector de 3.148 valores de metilación (un valor por sitio CpG) en 16 soft tokens que se inyectan en la secuencia de entrada del modelo base. El segundo es un conjunto de pesos QLoRA de rango 16 aplicados sobre Muse Glimmer 30B, que se carga en precisión 4 bits nf4. Los artefactos de servicio incluyen el panel de CpG, las clases de tejido, el umbral de decisión y los parámetros del adaptador (`serving.json`), así como un fondo de referencia sana por CpG (`mu.npy`) que presumiblemente se usa para normalizar la señal del paciente.

El entrenamiento se realizó en dos etapas sobre plasma simulado, generado mezclando tumores del dataset TCGA con sangre sana para cubrir 20 tipos de tejido. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco describe innovaciones de decodificación o atención. El código de carga e inferencia está en el repositorio `github.com/zoukmar/burotu`, módulo `burotu.muse`.

## Capacidades

- Lectura de perfiles de metilación de cfDNA: convierte 3.148 sitios CpG en 16 soft tokens interpretables por el modelo base.
- Clasificación de tejido de origen tumoral entre 20 tipos de tejido, con salida textual generada por el LLM.
- Inferencia en régimen de baja fracción tumoral: el autor reporta acierto del 15 % al 0,3 % de ADN tumoral en plasma y del 60 % al 1 %.
- Integración multimodal texto-ómica: el perfil de metilación se trata como una modalidad adicional dentro de la ventana de contexto del LLM.
- Capacidades heredadas de Muse Glimmer 30B (generación de texto, razonamiento, código): no documentadas en esta model card, por lo que no se pueden confirmar.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en biopsia líquida: usar el adaptador para clasificar tejido de origen en cohortes simuladas y comparar contra clasificadores clásicos de metilación, aprovechando que el modelo genera una respuesta textual con el tejido predicho y no solo un índice de clase.
- Prototipado de pipelines ómicos sobre LLM: servir como referencia de cómo comprimir matrices de alta dimensionalidad (miles de CpG) en pocos soft tokens, patrón reutilizable para otros paneles genómicos o proteómicos.
- Generación de informes exploratorios: el modelo puede producir una explicación en lenguaje natural del tejido inferido junto con la predicción, útil en cuadernos de laboratorio y revisiones internas.
- Evaluación de sensibilidad analítica: el umbral configurable en `serving.json` permite barrer puntos de operación y estudiar el compromiso entre sensibilidad y especificidad a fracciones tumorales del 0,3 %, 1 %, 3 % y 10 %.
- Docencia y divulgación: demostrar de forma reproducible cómo se acopla un cabezal biológico a un LLM open weight, con artefactos pequeños (0,9 GB) y código público.
- Base para ajuste fino adicional: al ser un adaptador PEFT de rango 16 sobre un modelo de 30B en 4 bits, se puede reentrenar con nuevos paneles de CpG o nuevas cohortes sin rehacer el modelo base.
- Filtro previo en estudios de cohorte: priorizar muestras con alta probabilidad de señal tumoral antes de análisis más costosos, siempre en contexto de investigación y nunca como decisión clínica.

## Benchmarks y rendimiento

Los únicos datos publicados son la recuperación del tejido de origen correcto en la primera predicción, sobre personas y tumores no vistos en entrenamiento, con 20 tipos de tejido y plasma simulado:

| ADN tumoral en plasma | Tejido de origen correcto a la primera |
|---|---|
| 0,3 % | 15 % |
| 1 % | 60 % |
| 3 % | 88 % |
| 10 % | 92 % |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la información disponible. El autor indica que las pruebas sobre plasma real son comprobaciones de sanidad de pequeño tamaño, sin métricas publicadas.

## Requisitos de hardware

- El adaptador ocupa 0,9 GB, pero la inferencia requiere cargar Muse Glimmer 30B en 4 bits nf4; el peso del modelo base en esa cuantización no se detalla en la información disponible.
- Como referencia orientativa para un modelo de 30B en 4 bits, se necesitan del orden de 16-20 GB de VRAM solo para pesos, más caché KV y activaciones; esta cifra es una estimación general, no un dato publicado por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar A100 40/80 GB, H100 o RTX 4090 24 GB en 4 bits, pero no está verificado.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posible en GPUs de 24 GB con cuantización agresiva, sujeto a verificación.
- Opciones de despliegue: la model card solo documenta la carga mediante `burotu.muse` con el modelo base en 4 bits nf4; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del adaptador (soft tokens más LoRA) hace que estos motores genéricos probablemente no lo soporten sin trabajo adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de tejido de origen a partir de metilación de cfDNA, ni adaptadores ómicos equivalentes sobre LLM open weight. Tampoco se ofrecen métricas frente a clasificadores convencionales entrenados sobre los mismos datos simulados.

## Limitaciones y advertencias

- Prototipo de investigación: el propio autor lo declara no apto como dispositivo médico; no debe usarse para decisiones clínicas.
- Entrenado y evaluado principalmente sobre plasma simulado (tumores TCGA mezclados en sangre sana); la validez sobre plasma real no está establecida más allá de comprobaciones de sanidad pequeñas.
- El rendimiento cae abruptamente en fracciones tumorales bajas: 15 % de acierto al 0,3 % de ADN tumoral, lo que limita su uso en cribado temprano.
- Dependencia estricta del modelo base: requiere la revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68` de `meta-models/Muse-Glimmer-30B` en 4 bits nf4; otras revisiones o cuantizaciones pueden invalidar los pesos.
- El panel está fijado a 3.148 sitios CpG; muestras procesadas con otra plataforma o preprocesamiento distinto no son compatibles sin reentrenar.
- Sesgos demográficos y técnicos: no se documenta la composición de las cohortes TCGA ni el balance por sexo, edad o ascendencia, por lo que se desconocen sesgos sistemáticos en la predicción de tejido.
- Riesgo de alucinación: al ser un LLM generando texto, puede producir una respuesta con formato plausible pero incorrecta; la evaluación publicada mide acierto a la primera, no calibración.
- Idiomas y contexto: sin datos; no se puede asumir un comportamiento multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del modelo base queda sujeto a los términos de Meta para Muse Glimmer 30B, no incluidos en esta información.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación de 2026-10-29: no hay evidencia de uso independiente ni replicación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zoukmar75/burotu-glimmer
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Código de carga e inferencia: https://github.com/zoukmar/burotu
- No se han encontrado en la información disponible papers, blogs, demos ni otros repositorios adicionales.
