# strongpear/Llama3.1-8B-RAFT_P100_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) entrenado sobre
`meta-llama/Llama-3.1-8B`. El identificador del modelo
(`RAFT_P100_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss`) sugiere, por convención de
nombrado del autor, un ajuste fino aumentado por recuperación (RAFT, *Retrieval-Augmented
Fine-Tuning*) en el dominio médico, con 5 documentos de contexto por ejemplo, cadena de
pensamiento (CoT) y rango de LoRA 64, seleccionando el checkpoint con mejor pérdida de
evaluación. Ninguna de estas inferencias está confirmada en la model card, que es la
plantilla por defecto de HuggingFace y no contiene descripción, datos de entrenamiento,
hiperparámetros ni resultados.

Se trata de un artefacto con nula tracción comunitaria: cero descargas, cero "likes" y una
model card sin rellenar. La fecha de creación registrada en el repositorio es el 12 de
septiembre de 2026 y la de actualización un minuto después, lo que junto con el resto de
metadatos sugiere una subida experimental o automatizada sin documentación asociada.

Su relevancia práctica es, por tanto, limitada y condicionada: puede servir como punto de
partida para reproducir un pipeline RAFT sobre Llama 3.1 8B en dominio sanitario, pero no
debe desplegarse en producción sin una evaluación propia, dado que no hay evidencia
publicada de su comportamiento, sesgos o calidad clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (adaptador LoRA sobre `meta-llama/Llama-3.1-8B`) |
| Parametros totales | Modelo base: 8.030 millones (8,03 B). Adaptador: ~168 M estimados (rango 64 sobre las 7 proyecciones lineales de 32 capas), no confirmado por el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del base: 128.000 tokens. No se especifica si el ajuste modificó este valor |
| Tipos de cuantizacion | Adaptador distribuido en safetensors (fp32). El modelo base admite GGUF (Q2_K–Q8_0), AWQ, GPTQ, bitsandbytes int8/int4 y FP8 |
| Idiomas soportados | No disponible en la ficha. El base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes); el ajuste parece centrado en ingles medico |
| Licencia | No disponible en el repositorio. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`, PEFT 0.20.0) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El adaptador se apoya en Llama 3.1 8B, un transformer decoder-only denso con normalización
RMSNorm pre-normalizada, activaciones SwiGLU, embeddings rotatorios (RoPE) y atención con
consultas agrupadas (GQA: 32 cabezas de consulta y 8 de clave/valor) sobre 32 capas, con un
vocabulario de 128.256 tokens. El modelo base se entrenó con aproximadamente 15 billones de
tokens y se alineó mediante SFT y RLHF con DPO. El tamaño del repositorio (0,7 GB) es
coherente con un adaptador de rango 64 aplicado a las siete proyecciones lineales
(q, k, v, o, gate, up, down) guardado en fp32: unos 168 millones de parámetros, es decir, en
torno al 2 % del total del modelo base. Esta cifra es una estimación derivada de las
dimensiones conocidas de Llama 3.1 8B, no un dato declarado por el autor.

No hay información verificable sobre el dataset de entrenamiento, el número de tokens, la
composición de los documentos recuperados ni los hiperparámetros (learning rate, épocas,
alpha del LoRA, scheduler). El nombre del repositorio apunta a un esquema RAFT, en el que el
modelo aprende a responder citando y extrayendo información de un conjunto reducido de
documentos de contexto (5 en este caso) mientras ignora distractores, combinando
recuperación con ajuste supervisado y razonamiento en cadena. El autor tampoco documenta si
hubo RLHF, DPO o destilación sobre el adaptador. La única referencia técnica de la model
card es el arXiv:1910.09700 (Lacoste et al., 2019), que corresponde a la calculadora de
impacto ambiental de ML y no a un artículo sobre el modelo.

## Capacidades

- Generación de texto en dominio biomédico: es el uso que sugiere el identificador del
  repositorio (etiqueta `MEDICAL`), aunque no existe ninguna evaluación que lo respalde.
- Respuesta condicionada a documentos: el esquema RAFT implica que el modelo debería citar y
  extraer respuestas de un contexto de 5 documentos, descartando pasajes irrelevantes.
- Razonamiento en cadena de pensamiento: la etiqueta `CoT` apunta a respuestas con pasos
  intermedios explícitos, sin formato de salida documentado.
- Generación de texto general: heredada del modelo base Llama 3.1 8B.
- Soporte multilingüe: heredado del base (8 idiomas declarados), sin constancia de que el
  ajuste preserve el rendimiento fuera del inglés.
- Tool calling / function calling: no confirmado. El base Llama 3.1 soporta llamadas a
  herramientas mediante prompt, pero un ajuste específico de dominio puede degradar esta
  capacidad y no hay pruebas al respecto.
- Capacidades de agente y razonamiento multi-paso: no disponibles / no evaluadas.
- Visión, audio o modo "thinking": no soportados (el base es exclusivamente de texto y no
  dispone de modo de razonamiento explícito).

## Casos de uso

- Preguntas y respuestas sobre literatura médica: el modelo está pensado para recibir 5
  documentos científicos como contexto y sintetizar una respuesta con razonamiento
  intermedio. Encaja en asistentes de revisión bibliográfica para investigadores que
  necesiten extraer conclusiones de un conjunto acotado de artículos.
- Resumen de historiales clínicos largos: gracias a la ventana de 128.000 tokens heredada,
  puede procesar informes completos, notas de evolución y pruebas de laboratorio de un
  paciente en una sola pasada, siempre con supervisión humana y datos anonimizados.
- Apoyo a la codificación clínica (CIE-10 / SNOMED): extracción de diagnósticos y
  procedimientos a partir de texto libre de informes para tareas administrativas de
  facturación, con validación posterior por codificadores profesionales.
- Búsqueda de interacciones farmacológicas: dado un conjunto de fichas técnicas recuperadas,
  responder a consultas sobre contraindicaciones citando el documento de origen. Requiere
  verificación obligatoria contra fuentes oficiales.
- Triage conversacional en atención primaria: clasificación inicial de síntomas y
  derivación, con el modelo actuando como primer filtro y siempre bajo protocolo clínico
  supervisado.
- Formación médica y generación de preguntas tipo test (MIR, USMLE): creación de reactivos
  con justificación razonada a partir de material docente, útil en plataformas de e-learning
  sanitario.
- Extracción de entidades en ensayos clínicos: identificación estructurada de criterios de
  inclusión/exclusión, dosis y variables de resultado en protocolos, integrada en pipelines
  de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no
incluye ninguna tabla de evaluación (ni MMLU, ni MedQA, ni PubMedQA, ni HumanEval) y el
repositorio registra cero descargas, por lo que tampoco existen evaluaciones de terceros. No
se deben extrapolar los resultados del modelo base Llama 3.1 8B a este adaptador: un ajuste
LoRA de dominio puede mejorar tareas concretas y degradar simultáneamente capacidades
generales.

## Requisitos de hardware

- Adaptador LoRA: 0,7 GB en fp32; unos 0,34 GB si se convierte a fp16. Requiere cargar
  además el modelo base completo.
- Pesos del base en fp16/bf16: ~16 GB. En int8: ~8,5 GB. En int4 (GPTQ/AWQ/GGUF Q4_K_M):
  ~4,9 GB.
- Caché KV con GQA (8 cabezas KV, 32 capas): aproximadamente 128 KB por token en fp16, es
  decir ~1 GB para 8.192 tokens, ~4,3 GB para 32.768 y ~17 GB para 128.000 tokens. Con
  cuantización de la caché a fp8/int8, esas cifras se reducen a la mitad.
- GPU recomendadas: para fp16 con contexto largo, A100 80 GB, H100 80 GB, L40S 48 GB o
  RTX 6000 Ada 48 GB. Para contexto de 8.000 a 16.000 tokens, una RTX 4090 o RTX 3090 de
  24 GB es suficiente.
- Cabe en GPU de consumo: sí. RTX 4090/3090 (24 GB) en fp16 con contexto moderado, o en
  int4 con contexto largo. RTX 4060 Ti 16 GB y similares en cuantización de 4 bits.
- Opciones de despliegue: `transformers` + PEFT (ruta nativa para un adaptador), vLLM con
  soporte de LoRA (`--enable-lora`), TGI con adaptadores, SGLang. Para llama.cpp u Ollama es
  necesario fusionar el adaptador con el base (`merge_and_unload`) y convertir a GGUF, ya que
  no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base, ya que el adaptador no tiene métricas
publicadas. Los valores marcados como "no verificado" deben confirmarse en las fichas
originales antes de tomarlos como definitivos.

| Modelo | Parametros | Contexto | Dominio / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B) | 8,03 B + ~168 M | 128 k (heredado) | Medico, RAFT + CoT, r64 | No disponible | Repositorio publico, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 k | Generalista, alineado con instrucciones | Llama 3.1 Community License | Ampliamente desplegado, ecosistema maduro |
| OpenBioLLM-Llama3-8B | 8 B | 8 k | Biomedico, ajuste sobre Llama 3 8B Instruct | Llama 3 (no verificado) | Repositorio publico con documentacion |
| BioMistral-7B | 7 B | 8 k | Biomedico, ajuste sobre Mistral-7B-v0.1 | Apache 2.0 (no verificado) | Repositorio publico, benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,61 B | 128 k | Generalista multilingue | Apache 2.0 | Ecosistema amplio, buen soporte de cuantizacion |

Frente a alternativas biomédicas establecidas, este adaptador ofrece una ventana de contexto
muy superior (128 k frente a 8 k), lo que resulta ventajoso para RAFT con documentos largos,
pero carece de la validacion empirica, la documentacion y la claridad de licencia que si
presentan OpenBioLLM o BioMistral.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparámetros,
  procedencia de los documentos ni metodología de evaluación. Cualquier uso en producción
  parte de cero en materia de trazabilidad.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Llama 3.1 8B,
  se heredan presumiblemente las restricciones de la Llama 3.1 Community License (cláusula de
  700 millones de usuarios mensuales, atribución "Built with Llama" y política de uso
  aceptable), pero la ausencia de licencia explícita impide confirmar los términos exactos.
  No debe asumirse uso comercial libre.
- Riesgo de alucinación clínica: cualquier modelo de 8 B ajustado sobre datos médicos puede
  generar afirmaciones plausibles pero falsas sobre dosis, diagnósticos o interacciones. En
  ausencia de evaluación, el riesgo es indeterminado y potencialmente alto.
- Sesgos: no documentados. Los sesgos del corpus médico inglés (infrarrepresentación de
  poblaciones no caucásicas, sesgo de publicación hacia resultados positivos, predominio de
  terminología anglosajona) son esperables por herencia del base y del dominio.
- Limitación idiomática: no se confirma soporte en español para terminología médica. Aunque
  el base soporte 8 idiomas, un ajuste en inglés puede degradar el rendimiento multilingüe.
- Degradación de capacidades generales: un LoRA de rango 64 sobre todas las proyecciones
  puede provocar olvido catastrófico parcial en tareas ajenas al dominio médico. No se ha
  medido.
- Sin validación comunitaria: cero descargas y cero interacciones. No hay informes de
  terceros, issues ni reproducibilidad verificada.
- Advertencia regulatoria: un modelo así no constituye un producto sanitario. Su uso en
  contextos clínicos requeriría cumplimiento del Reglamento (UE) 2017/745 sobre productos
  sanitarios y del RGPD para datos de salud, además de validación clínica formal.
- Metadatos anómalos: la fecha de creación registrada (septiembre de 2026) y la
  actualización un minuto posterior indican una subida automatizada o con fines de prueba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_P100_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base alineado: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Referencia citada en la model card (calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML (Lacoste et al., 2019): https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Comparativa biomédica OpenBioLLM: https://huggingface.co/aaditya/OpenBioLLM-Llama3-8B
- Comparativa biomédica BioMistral: https://huggingface.co/BioMistral/BioMistral-7B

Nota: la búsqueda web asociada a esta ficha devolvió exclusivamente resultados sobre la
Antártida, sin relación alguna con el modelo. No se ha utilizado ninguno de ellos.
