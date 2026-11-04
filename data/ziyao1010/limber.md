# Ziyao1010/LIMBER

## Resumen

LIMBER (Layer-Interleaved Mamba-Bidirectional Encoder for RNA) es un modelo fundacional de ARN desarrollado por investigadores de la Universidad de Maryland (College Park) y la Universidad de Notre Dame. Resuelve el problema del modelado de secuencias de ARN combinando atención bidireccional tipo Transformer con capas de espacio de estados selectivo Mamba en un patrón repetido Transformer-Transformer-Mamba (TTM). El modelo se preentrena mediante modelado de lenguaje enmascarado (MLM) sobre 40.498.819 secuencias de RNAcentral.

La motivación arquitectónica es doble: la autoatención captura acoplamientos directos entre posiciones arbitrarias, señal de coevolución de largo alcance que deja el emparejamiento de bases en la secuencia; Mamba aporta un prior complementario para estructura ordenada, ya que el ARN es un polímero direccional con motivos recurrentes que la atención por sí sola no impone. La intercalación de ambos mecanismos dota al modelo de las dos capacidades simultáneamente.

El repositorio publica tres modelos principales (macro de 664,3M, meso de 303,6M y nano de 91,7M de parámetros), además de un panel completo de escalado de tamaño y datos, y controles puros Transformer y puros Mamba entrenados con ajustes idénticos para aislar la variable arquitectónica. El modelo está orientado a predicción y comprensión de estructura y función del ARN, con evaluaciones en estructura secundaria, clasificación de ncRNA, IRES, MRL e interacción ARN-molécula pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer bidireccional + Mamba SSM, patrón TTM (Transformer-Transformer-Mamba) repetido |
| Parametros totales | 664,3M (macro), 303,6M (meso), 91,7M (nano) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.022 nucleótidos (embeddings posicionales para 1.026 tokens, incluyendo especiales) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de secuencias biológicas de ARN) |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), configuración en `model_config.json` |

Detalles por variante principal:

| Variante | Capas | Hidden | Cabezas | FFN | Params |
|---|---|---|---|---|---|
| LIMBER-macro | 33 | 1280 | 20 | 5120 | 664,3M |
| LIMBER-meso | 15 | 1280 | 20 | 5120 | 303,6M |
| LIMBER-nano | 18 | 640 | 10 | 2560 | 91,7M |

## Arquitectura y entrenamiento

LIMBER es un codificador híbrido que intercala bloques de atención Transformer bidireccional con capas Mamba de espacio de estados selectivo siguiendo un patrón TTM repetido. La atención aporta la capacidad de capturar dependencias directas entre cualquier par de posiciones, lo que en ARN se corresponde con la señal coevolutiva del emparejamiento de bases. Mamba, al ser un modelo de estado recurrente y direccional, impone un prior sobre el orden secuencial del polímero de ARN y sus motivos recurrentes. Una única clase (`HybridMambaForMaskedLM`) cubre las tres arquitecturas: el campo `layer_pattern` de `model_config.json` selecciona `TTMTTM...`, `TTTTTT...` o `MMMMMM...`.

El preentrenamiento se realiza mediante modelado de lenguaje enmascarado (MLM) sobre 40.498.819 secuencias de RNAcentral. La tokenización es a resolución de nucleótido único con un vocabulario de 10 tokens (`[PAD] [UNK] [CLS] [SEP] [MASK]` más `A U C G N`); el preprocesado pasa a mayúsculas, convierte T en U y mapea cualquier símbolo no ACGU a N. El repositorio incluye además un panel de ablación y escalado: variantes de tamaño (10M, 50M), fracciones de datos de preentrenamiento (20 %, 40 %, 60 %, 80 %), presupuestos de entrenamiento (época 1, 6, 9), variaciones de forma a presupuesto fijo (thin, wide) y anchura de convolución (`dconv2`). También publica controles puros Transformer (`bert_100m_epoch6`, `bert_300m_epoch6`, `bert_650m_epoch6`) y puros Mamba (`kmer1-PureMamba-100M`, `kmer1-PureMamba-300M`, `PureMamba-650M`) entrenados con anchura, profundidad, datos y optimizador idénticos, de modo que la arquitectura es la única variable. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de ajuste posteriores al preentrenamiento.

## Capacidades

- Modelado de secuencias de ARN a resolución de nucleótido único con contexto de hasta 1.022 nt.
- Predicción de estructura secundaria de ARN (evaluada con F1 flexible ±1 nt bajo el protocolo de fine-tuning de RiNALMo).
- Clasificación de ARN no codificante (ncRNA).
- Predicción de elementos IRES (Internal Ribosome Entry Site).
- Predicción de MRL (motivos/regiones relevantes, según la terminología del paper).
- Predicción de interacción ARN-molécula pequeña.
- Extracción de representaciones por nucleótido (última capa, dimensión 1280 en macro) y representación agregada de secuencia vía token `[CLS]`, aptas para cabezas downstream.
- Generación de logits de masked-LM sobre el vocabulario de nucleótidos (10 tokens).
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües: es un modelo específico de dominio biológico.

## Casos de uso

- Predicción de estructura secundaria de ARN en pipelines de anotación: el modelo se fine-tunea con el protocolo de RiNALMo y produce emparejamientos de bases con F1 flexible de hasta 0,895 en bpRNA TS0 (macro), útil para preanotar estructuras antes de validación experimental.
- Clasificación funcional de ncRNA: usando el embedding `[CLS]` de 1280 dimensiones como entrada a una cabeza lineal, se puede clasificar familias de ARN no codificante en cribados masivos de transcriptoma.
- Análisis de regiones IRES en genomas virales: el modelo permite identificar elementos de entrada ribosomal interna en secuencias de hasta 1.022 nt, relevante para virología y diseño de vectores.
- Cribado de interacciones ARN-molécula pequeña: las representaciones por nucleótido permiten entrenar cabezas para predecir afinidad o sitios de unión, aplicable en descubrimiento de fármacos dirigidos a ARN.
- Anotación de motivos y regiones funcionales (MRL): el modelo sirve como extractor de características para localizar regiones con señal funcional en secuencias largas de ARN.
- Investigación en arquitecturas híbridas: los checkpoints de control (Transformer puro y Mamba puro con ajustes idénticos) permiten reproducir comparativas arquitectónicas en un dominio biológico concreto, útil para grupos que estudian SSM frente a atención.
- Extracción de embeddings para búsqueda y agrupamiento de secuencias: los vectores `[CLS]` permiten clustering de familias de ARN y búsqueda de vecinos en espacios de representación aprendidos.

## Benchmarks y rendimiento

Resultados publicados en la model card para estructura secundaria de ARN (F1 flexible ±1 nt, protocolo de fine-tuning de RiNALMo):

| Modelo | bpRNA TS0 (mediana) | Rivas TestSetB (mediana) | ArchiveII inter-family (media) |
|---|---|---|---|
| LIMBER-macro | 0,895 | 0,816 | 0,809 |
| LIMBER-meso | 0,889 | 0,791 | 0,773 |
| LIMBER-nano | 0,870 | 0,772 | 0,736 |
| AIDO.RNA-650M | 0,851 | no disponible en la información proporcionada | no disponible en la información proporcionada |

La model card indica que todos los baselines se fine-tunearon y evaluaron bajo el mismo protocolo que LIMBER, de modo que el codificador de ARN es la única variable. No se han proporcionado en la información disponible resultados numéricos de los benchmarks de clasificación de ncRNA, IRES, MRL ni interacción ARN-molécula pequeña; solo se referencian las figuras correspondientes. Tampoco se aportan cifras de los controles puros Transformer o Mamba en esta información.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32, dado que los pesos son `.bin` sin cuantización publicada): aproximadamente 2,7 GB para macro (664,3M), 1,2 GB para meso (303,6M) y 0,37 GB para nano (91,7M), más activaciones y memoria del contexto.
- En fp16/bf16 (requiere conversión manual, no se distribuyen pesos en esos formatos): aproximadamente 1,3 GB para macro, 0,6 GB para meso y 0,18 GB para nano.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090 24 GB) es suficiente para las tres variantes en inferencia; para fine-tuning con lotes grandes se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, todas las variantes, incluso en tarjetas de 8 GB para macro en fp16.
- Opciones de despliegue: PyTorch con `transformers`, `safetensors` y `huggingface_hub`; requiere además `causal-conv1d` y `mamba-ssm` para las capas Mamba. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo autoregresivo, sino un codificador MLM).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIMBER-macro | 664,3M | 1.022 nt | Híbrida Transformer+Mamba (TTM) | no disponible | HuggingFace (repo de 26,6 GB con todos los checkpoints) |
| AIDO.RNA-650M | ~650M | no disponible | no disponible | no disponible | referenciado como baseline en la model card |
| RiNALMo | no disponible | no disponible | Transformer | no disponible | protocolo de fine-tuning de referencia citado en la model card |
| Controles puros Transformer / Mamba de LIMBER | 100M / 300M / 650M | 1.022 nt | Transformer puro o Mamba puro | no disponible | incluidos en el mismo repositorio |

La comparativa cuantitativa disponible se limita a estructura secundaria: LIMBER-macro supera a AIDO.RNA-650M en bpRNA TS0 (0,895 frente a 0,851). No se dispone de datos comparativos de contexto, licencia ni rendimiento en otras tareas para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de ARN: no procesa texto natural, código, imágenes ni audio; no admite tool calling ni uso como agente.
- Longitud máxima efectiva de 1.022 nucleótidos; secuencias más largas requieren truncado o fragmentación.
- Tokenización a nucleótido único: cualquier símbolo no ACGU (incluidas bases modificadas) se mapea a `N`, lo que puede degradar la predicción en secuencias con modificaciones post-transcripcionales.
- Pesos distribuidos únicamente en `pytorch_model.bin` (fp32); no hay versiones GGUF, safetensors ni cuantizadas publicadas, lo que limita el despliegue en entornos con requisitos de formato o memoria estrictos.
- Dependencia de `causal-conv1d` y `mamba-ssm`, que requieren compilación y compatibilidad con la versión de CUDA y PyTorch del entorno.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse con los autores antes de cualquier despliegue en producción.
- Riesgo de alucinación estructural: como cualquier modelo de predicción biológica, puede generar emparejamientos de bases plausibles pero incorrectos; se recomienda validación experimental o con herramientas de plegamiento físico.
- Sesgos de datos: el preentrenamiento sobre RNAcentral puede sobrerrepresentar familias de ARN bien caracterizadas e infrarrepresentar secuencias raras o de organismos poco estudiados.
- El repositorio (26,6 GB) contiene todos los checkpoints del paper, no solo los modelos principales; descargar el conjunto completo consume espacio y ancho de banda considerables.
- No se documentan evaluaciones de robustez frente a secuencias adversariales ni de calibración de incertidumbre.

## Enlaces

- HuggingFace: https://huggingface.co/Ziyao1010/LIMBER
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.10.28.762670v1
- Código: https://github.com/ziyaow1010/LIMBER
- Figura de visión general de la arquitectura: https://raw.githubusercontent.com/ziyaow1010/LIMBER/main/assets/fig1_overview.png
- Figura de benchmarks de estructura secundaria: https://raw.githubusercontent.com/ziyaow1010/LIMBER/main/assets/fig5_secondary_structure.png
- Figura de resultados downstream: https://raw.githubusercontent.com/ziyaow1010/LIMBER/main/assets/fig6_downstream.png
- Script de carga rápida: `scripts/load_hybrid650.py` (dentro del repositorio de código)
