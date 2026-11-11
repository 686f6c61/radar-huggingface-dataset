# Wenvia/Hyderabad_Gemma

## Resumen

Hyderabad_Gemma es un adaptador LoRA para Gemma 3 12B Instruct, desarrollado por Wenvia, especializado en la extracción de información estructurada a partir del OCR de documentos de propiedad de Andhra Pradesh (India) en telugu. El modelo recibe el texto OCR de una escritura de compraventa y devuelve un único objeto JSON con las partes intervinientes y sus identificadores, los datos de la propiedad, los importes y los detalles de registro. Resuelve un problema muy concreto: convertir documentos legales no estructurados y ruidosos en registros explotables por sistemas posteriores.

Técnicamente es un adaptador PEFT (QLoRA, rango 16) sobre `unsloth/gemma-3-12b-it-bnb-4bit`, es decir, sobre un Gemma 3 de 12 mil millones de parámetros cuantizado a 4 bits. El autor lo plantea como un especialista deliberadamente separado del modelo hermano para documentos de Karnataka (`anandkaman/gemma3_12b_deedexp`), ya que el idioma documental, la tabla de tasas y el vocabulario de roles difieren entre estados.

Su relevancia radica en el enfoque de evaluación y en las reglas de diseño: cero inversiones de rol comprador/vendedor en 11 documentos retenidos, y una política explícita de devolver `null` antes que inventar un dato. Con 26 descargas y publicado en noviembre de 2026, es un modelo de nicho con validación pequeña (n=11) pero documentación inusualmente honesta sobre sus límites.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre la base |
| Parametros totales | 12B en el modelo base; el adaptador LoRA no reporta recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 11 008 tokens de entrenamiento (`max_seq_length=11008`) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); adaptador en safetensors (se puede fusionar y recuantizar) |
| Idiomas soportados | Telugu (te) e inglés (en) |
| Licencia | Gemma (licencia de uso de Google para la familia Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA de rango 16 entrenado sobre `unsloth/gemma-3-12b-it-bnb-4bit`, un Gemma 3 12B Instruct cuantizado a 4 bits y optimizado con Unsloth. El corpus de entrenamiento es muy reducido: 49 documentos y 60 filas de entrenamiento, con 36 pasos de optimización y una ventana de 11 008 tokens. Se construyó sobre una base adaptada al telugu, y el 18 % de las filas de entrenamiento son variantes de esquema parcial (subset), lo que según el autor también mejora la precisión por campo del esquema completo.

La innovación metodológica más destacable no está en la arquitectura sino en el etiquetado: las etiquetas se derivaron del endoso de registro de cada documento, no del registro acompañante. Esto corrigió 11 inversiones de rol comprador/vendedor y eliminó 5 testigos identificativos que un conjunto de etiquetas derivado del registro había registrado como partes. El entrenamiento usa decodificación greedy en inferencia y prescribe tres prompts con el mismo bloque de reglas que difieren en una frase que nombra el esquema a devolver (completo, solo partes, solo propiedad y registro).

## Capacidades

- Extracción de información estructurada: devuelve un único objeto JSON con partes, identificadores, propiedad, importes y detalles de registro a partir de texto OCR.
- Tres modos de salida entrenados: esquema completo (`PROMPT_full.txt`), solo partes (`PROMPT_subset_1.txt`) y solo propiedad y registro (`PROMPT_subset_2.txt`).
- Razonamiento sobre roles documentales: distingue ejecutante (vendedor), reclamante (comprador) y testigo, y aplica reglas como que un testigo nunca es parte ni un apoderado tampoco.
- Manejo explícito de datos ausentes: devuelve `null` en lugar de inventar un campo o un identificador malformado.
- Procesamiento de documentos largos: entrenado a 11 008 tokens, con instrucción de recortar el OCR por el medio conservando el bloque de instrucciones y el inicio y el final del documento.
- Multilingüe limitado: telugu e inglés.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de registros de propiedad: ingerir el OCR de escrituras de Andhra Pradesh y producir un JSON normalizado por documento para alimentar una base de datos catastral o un registro inmobiliario.
- Verificación de partes en procesos de diligencia debida: usar el prompt de subconjunto de partes para extraer comprador, vendedor y parte confirmante con sus identificadores en una llamada de aproximadamente la mitad de coste de decodificación (465 caracteres de salida frente a 1017 del esquema completo).
- Automatización de cálculo de tasas: extraer el importe de la contraprestación, el impuesto de timbre y la tasa de registro para conciliar contra la tabla de tasas del estado; el modelo acierta 9 de 11 en timbre y tasa en la evaluación publicada.
- Enriquecimiento de expedientes para aseguradoras y entidades financieras: obtener fecha de registro, oficina de registro y estado del documento en un objeto JSON parseable, con 11/11 de acierto en esos campos en la muestra evaluada.
- Control de calidad de pipelines OCR: dado que el modelo devuelve `null` en lugar de adivinar, sirve como señal de campos que el OCR no capturó correctamente y que requieren revisión humana.
- Extracción selectiva de bajo coste: en flujos donde solo se necesita la mitad del registro (solo partes o solo importes), el prompt de subconjunto reduce la longitud de salida al 46 % y aproximadamente duplica la velocidad de la llamada.
- Análisis de corpus históricos: procesar lotes de documentos de un mismo estado con una ventana de 11k tokens, recortando el OCR por el medio cuando exceda ese límite.

## Benchmarks y rendimiento

Evaluación sobre 11 documentos retenidos, no vistos en entrenamiento, con etiquetas derivadas de los propios documentos y no del registro acompañante.

| Métrica | Resultado |
|---|---|
| Inversiones de rol comprador/vendedor | 0 |
| Recuento de compradores exacto | 11/11 |
| Recuento de vendedores exacto | 11/11 |
| Contraprestación de venta exacta | 11/11 |
| Fecha de registro exacta | 11/11 |
| Oficina de registro exacta | 11/11 |
| Estado exacto | 11/11 |
| Impuesto de timbre exacto | 9/11 |
| Tasa de registro exacta | 9/11 |
| Nombres de partes recuperados | 24/32 |
| Salidas que no parsean como JSON | 0/11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que n=11 frente a los 60 del modelo Kannada, que estos documentos son los más difíciles por construcción (retenidos por longitud, y la longitud correlaciona con el número de partes) y que 6 de los 11 prompts superan la ventana de entrenamiento de 11k tokens, por lo que parte del OCR se trunca en generación. Los campos `pincode` y dirección del anexo puntúan 0 por una convención de etiquetado no resuelta en el registro de origen, no por debilidad del modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,4 GB en 4 bits, según el autor.
- GPU recomendadas: no se especifican modelos concretos; por el perfil de memoria, una RTX 4090 (24 GB) o una A100/H100 con margen amplio para lotes mayores.
- Cabe en GPU de consumo: sí, con 12 GB o más de VRAM en 4 bits; una RTX 3060 de 12 GB queda en el límite y puede requerir reducir `max_seq_length`.
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastLanguageModel`) con `load_in_4bit=True` y la plantilla de chat `gemma-3`. El adaptador, al ser PEFT en safetensors, puede fusionarse con la base y servirse con vLLM, TGI o llama.cpp tras la conversión a GGUF; estas últimas rutas no están documentadas por el autor.
- Latencia y throughput: no se publican cifras absolutas. El autor indica que el prompt de subconjunto es aproximadamente 2x más rápido por la menor longitud de salida (46 % del tamaño del esquema completo), al ser la decodificación secuencial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wenvia/Hyderabad_Gemma | 12B (base) + LoRA | 11 008 tokens | Extracción de escrituras de Andhra Pradesh (telugu) | Gemma | Hugging Face, 26 descargas |
| anandkaman/gemma3_12b_deedexp | 12B (base) + LoRA | no disponible | Extracción de escrituras de Karnataka; evaluación con n=60 | no disponible | Hugging Face |
| Gemma 3 12B Instruct (base) | 12B | no disponible en la información | Modelo generalista multilingüe | Gemma | Hugging Face / Google |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación relevante es de especialización: el modelo hermano de Karnataka cubre otro estado con otro vocabulario de roles y tabla de tasas, y el Gemma 3 base no está ajustado para producir JSON de escrituras.

## Limitaciones y advertencias

- Muestra de evaluación muy pequeña: n=11 frente a n=60 del modelo Kannada; las cifras de precisión tienen un intervalo de confianza amplio.
- Ventana de contexto efectiva: 6 de los 11 documentos evaluados superan los 11 008 tokens y parte del OCR se trunca en generación; el autor recomienda recortar por el medio, lo que puede eliminar información intermedia.
- Cobertura geográfica y lingüística estricta: solo documentos de Andhra Pradesh en telugu; no es un modelo multiestado y no debe aplicarse a otros estados sin reentrenamiento.
- Campos no evaluables: `pincode` y dirección del anexo no pueden puntuarse por una convención de etiquetado sin resolver; la dirección recupera aproximadamente 0,4 de los tokens del gold pero puntúa 0 en coincidencia exacta.
- Nombres de partes incompletos: 24/32 recuperados, por lo que la extracción de nombres requiere verificación.
- Riesgo de alucinación mitigado pero no eliminado: la política de entrenamiento prioriza `null` sobre datos inventados y califica de error crítico la invención, pero no hay garantía formal.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de la política de uso aceptable de Google; conviene revisar los términos antes de un despliegue en producción.
- Sin datos públicos de sesgo ni de robustez frente a OCR de baja calidad más allá de la muestra evaluada.
- Ecosistema limitado: 26 descargas y 0 likes, sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wenvia/Hyderabad_Gemma
- Modelo hermano (Kannada): https://huggingface.co/anandkaman/gemma3_12b_deedexp
- Modelo base: https://huggingface.co/unsloth/gemma-3-12b-it-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Contacto del autor: kamananand98@gmail.com
