# YunfeiHu/interpreTFM

## Resumen

interpreTFM es un repositorio de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre las activaciones internas de tres modelos fundacionales de transcriptómica: c2s_scale, Geneformer y scGPT. Lo desarrolla YunfeiHu y se publica bajo la librería `interpretfm` (versión 1.0.0). El objetivo no es generar texto ni hacer predicciones biológicas directas, sino descomponer las representaciones latentes de esos modelos en características interpretables y asociarlas a conceptos biológicos concretos, lo que resuelve el problema de la opacidad de los modelos fundacionales en biología computacional.

Cada SAE se organiza en una jerarquía `<modelo>/<dataset>/<capa>/` y contiene los pesos en `sae.safetensors`, un `config.json`, una tabla de características retenidas (`features.csv`), métricas (`metrics.json`) y su propia model card. Se han entrenado SAEs sobre dos conjuntos de datos de transcriptómica espacial: una sección de cáncer de pulmón de células no pequeñas humanas con CosMx y una sección de carcinoma de células renales humanas con Xenium.

La relevancia actual radica en que ofrece una vía práctica para auditar y explicar modelos fundacionales de célula única sin reentrenarlos: los SAE permiten mapear activaciones a conceptos con métricas de calidad publicadas (FVU y F1 de concepto). El repositorio ocupa 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoders (SAE) entrenados sobre activaciones de modelos transformer de transcriptómica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo de contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (dominio biológico, no lingüístico) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | safetensors (`sae.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es la de un sparse autoencoder por capa: un encoder que proyecta activaciones de dimensión `d_in` a un espacio disperso de mayor dimensión (`Features`) y un decoder que reconstruye la activación original. Las dimensiones de entrada varían según el modelo base: 2304 para c2s_scale (capa 13), 1152 para Geneformer (capa 1) y 512 para scGPT (capas `1.norm2` y `2.norm2`). El número de características es siempre 8 veces `d_in` (18432, 9216 y 4096 respectivamente).

El entrenamiento se realiza por separado para cada combinación de modelo, dataset y capa. Los datasets son secciones de transcriptómica espacial: CosMx de cáncer de pulmón no microcítico y Xenium de carcinoma renal. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo ajuste fino con RLHF o DPO, algo que no aplica a este tipo de modelo. La innovación técnica principal es la evaluación de interpretabilidad mediante FVU (fracción de varianza no explicada) y F1 de concepto con partición por filas, además de la retención de un subconjunto de características con conceptos asociados (entre 94 y 261 por capa).

## Capacidades

- Descomposición interpretable de activaciones de modelos fundacionales de transcriptómica en características dispersas.
- Asociación de características a conceptos biológicos mediante la tabla `features.csv`.
- Evaluación cuantitativa de la calidad de reconstrucción (FVU) y de la alineación conceptual (F1 de concepto con partición por filas).
- Carga programática por capa mediante `interpretfm.hub.load_sae` y la clase `Encoder` de `interpretfm.sae`.
- Soporte de tutorial reproducible con `interpretfm.hub.tutorial_bundle` y `interpretfm.hub.tutorial_crop` sobre un recorte de CosMx.
- Cobertura de tres modelos base (c2s_scale, Geneformer, scGPT) y dos tecnologías de transcriptómica espacial (CosMx, Xenium).
- No dispone de generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Auditoría de modelos fundacionales de célula única: cargar el SAE de la capa deseada con `load_sae` y examinar qué características se activan ante tipos celulares o genes concretos, lo que permite justificar decisiones del modelo en estudios biológicos.
- Análisis de expresión génica en transcriptómica espacial: usar las características retenidas de la capa `layer_13` de c2s_scale sobre CosMx para identificar patrones asociados a regiones tumorales de cáncer de pulmón.
- Comparación entre tecnologías de captura: contrastar los SAE entrenados sobre CosMx y Xenium para evaluar si las representaciones latentes de un mismo modelo base capturan conceptos biológicos de forma consistente entre plataformas.
- Validación de interpretabilidad en pipelines de investigación: integrar `metrics.json` y `features.csv` en flujos de evaluación que comparen FVU y F1 de concepto entre capas y modelos antes de publicar un análisis.
- Reproducibilidad de estudios: ejecutar el tutorial `docs/tutorials/cosmx_crop.ipynb` con `tutorial_bundle` y `tutorial_crop` para replicar el recorte de CosMx y verificar resultados de forma local.
- Docencia y formación en biología computacional: usar los SAE como ejemplo práctico de interpretabilidad mecanicista aplicada a modelos fundacionales en un entorno controlado y con licencia GPL-3.0.
- Desarrollo de herramientas de anotación asistida: emplear las características con concepto asociado como señales auxiliares para anotar tipos celulares en secciones de transcriptómica espacial, siempre con validación experta.

## Benchmarks y rendimiento

| Modelo | Dataset | Capa | d_in | Features | FVU | Concept F1 (row split) | Raw dimensions | Retained features |
|---|---|---|---|---|---|---|---|---|
| c2s_scale | cosmx | layer_13 | 2304 | 18432 | 0.111 | 0.317 | 0.107 | 170 |
| c2s_scale | xenium | layer_13 | 2304 | 18432 | 0.095 | 0.411 | 0.253 | 94 |
| geneformer | cosmx | layer_1 | 1152 | 9216 | 0.077 | 0.349 | 0.110 | 261 |
| geneformer | xenium | layer_1 | 1152 | 9216 | 0.077 | 0.450 | 0.261 | 125 |
| scgpt | cosmx | layer_1.norm2 | 512 | 4096 | 0.058 | 0.339 | 0.175 | 194 |
| scgpt | xenium | layer_2.norm2 | 512 | 4096 | 0.070 | 0.462 | 0.319 | 118 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,9 GB y cada SAE individual es de tamaño reducido (pesos en `sae.safetensors` por capa), por lo que la inferencia cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM, dado el tamaño del repositorio; no se confirma un mínimo exacto.
- Opciones de despliegue: la librería `interpretfm` (versión 1.0.0) mediante `interpretfm.hub.load_sae` y `interpretfm.sae.Encoder`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| interpreTFM | SAE sobre activaciones de modelos de transcriptómica | no disponible | no aplica | GPL-3.0-or-later | Hugging Face (`YunfeiHu/interpreTFM`) |
| SAE genéricos para LLM (p. ej. publicados por labs de interpretabilidad) | SAE sobre activaciones de transformers de lenguaje | no disponible | no aplica | variable | no disponible en la información proporcionada |
| Modelos base c2s_scale, Geneformer, scGPT | Modelos fundacionales de transcriptómica | no disponible | no disponible | cada uno con su propia licencia | referenciados como base, sin enlaces en la información |

No se dispone de datos comparativos de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre dos secciones tumorales concretas (pulmón y riñón), las características pueden no generalizar a otros tejidos o patologías.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las asociaciones característica-concepto de `features.csv` son inferidas y deben validarse biológicamente; el F1 de concepto es moderado (0,317–0,462).
- Limitaciones de contexto o idioma: no es un modelo lingüístico; no procesa texto libre ni conversaciones. Su alcance se limita a las capas y modelos para los que se han entrenado SAE.
- Restricciones de licencia: GPL-3.0-or-later, licencia copyleft que exige liberar el código derivado bajo la misma licencia; los modelos base y datasets conservan sus propias licencias, que deben revisarse por separado antes de uso comercial.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado; la madurez y el mantenimiento no están contrastados. La dependencia de la librería `interpretfm` 1.0.0 y de rutas jerárquicas concretas puede complicar la integración en sistemas existentes.
- El FVU varía entre 0,058 y 0,111, lo que indica una reconstrucción razonable pero no perfecta; la interpretación de características debe acompañarse de análisis de sensibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/YunfeiHu/interpreTFM
- Librería `interpretfm` (referenciada en la model card, sin URL directa en la información): no disponible
- Tutorial del repositorio: `docs/tutorials/cosmx_crop.ipynb` (ruta interna, sin URL pública en la información)
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada
