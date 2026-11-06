# Z-Nadjib/ClauseLM-Qwen2.5-1.5B

## Resumen

ClauseLM-Qwen2.5-1.5B es un modelo de extraccion de informacion en contratos comerciales desarrollado por Z-Nadjib, disponible en Hugging Face. Se trata de un ajuste fino (fine-tuning) de Qwen2.5-1.5B-Instruct mediante QLoRA sobre el dataset CUAD (Contract Understanding Atticus Dataset), con los pesos LoRA ya fusionados en la base de 16 bits. Su funcion es leer un fragmento de contrato y devolver un objeto JSON con los pasajes textuales (verbatim) que pertenecen a cada una de las 41 categorias de clausulas de CUAD: partes, fechas, ley aplicable, derechos de terminacion, limites de responsabilidad, seguros, y mas.

El problema que resuelve es la extraccion estructurada y fundamentada (grounded) de clausulas legales sin depender de modelos grandes de pago. Cada valor devuelto es un fragmento literal del contrato, lo que facilita la verificacion humana y reduce el riesgo de alucinacion. Con 1.543.714.304 parametros y una latencia de 18 segundos por contrato en una RTX 5080, es una alternativa ligera y economica (unos 0,002 USD por contrato en alquiler on-demand) frente a pipelines con LLMs generalistas.

Es relevante ahora porque la extraccion de clausulas contractuales es una tarea tipica de legal tech que suele resolverse o con modelos NER poco flexibles o con LLMs costosos; este modelo demuestra que un fine-tuning QLoRA de 29 minutos en una sola GPU de consumo alcanza un span F1 micro de 57,2, muy por encima del zero-shot del modelo base (11,7) y del enfoque NER con Legal-BERT (42,7).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), ajustado con QLoRA fusionado |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en entrenamiento); entrada por fragmento de ~6.000 caracteres |
| Tipos de cuantizacion | Pesos publicados en bf16/fp16 (3,1 GB); el entrenamiento uso base cuantizada a 4 bits NF4, ya fusionada |
| Idiomas soportados | Ingles (entrenado solo con contratos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder de 1.500 millones de parametros optimizado para instrucciones. El ajuste fino se realizo con QLoRA: base cuantizada a 4 bits (NF4) y adaptadores LoRA con rango 32 y alpha 32 aplicados a todas las proyecciones lineales, posteriormente fusionados en los pesos de 16 bits para inferencia sin sobrecoste. El entrenamiento uso el framework Unsloth 2026.10.9 con TRL 1.15.0 y transformers 5.17.0, optimizador AdamW 8-bit, learning rate 2e-4 con schedule coseno, 3% de warmup, batch efectivo de 16 y 2 epocas. La funcion de perdida se calculo solo sobre los tokens de completado (el JSON), no sobre el prompt.

Los datos de entrenamiento provienen de CUAD v1: 367 contratos de entrenamiento (41 reservados para validacion, segun el split oficial), procesados en 3.402 ventanas de 6.000 caracteres con 600 caracteres de solapamiento, de las cuales el 21% no contiene ninguna clausula (ejemplos negativos). El entrenamiento completo tardo 29 minutos en una sola NVIDIA RTX 5080 de 16 GB. Un detalle tecnico importante: la configuracion de generacion incluida recomienda decodificacion greedy sin penalty de repeticion, ya que las salidas copian texto literal de la entrada y dicho penalty degradaria la fidelidad de la copia.

## Capacidades

- Extraccion de las 41 categorias de clausulas de CUAD en formato JSON estructurado, incluyendo `parties`, `governing_law`, `expiration_date`, `renewal_term`, `cap_on_liability`, `insurance`, `non_compete`, `license_grant`, `audit_rights`, entre otras.
- Salida fundamentada: cada valor es un span verbatim del contrato, lo que permite verificacion y trazabilidad.
- Generacion de JSON utilizable en el 100% de los casos de test (sin salidas malformadas).
- Manejo de documentos largos mediante chunking (ventanas de 6.000 caracteres con solapamiento de 600) a traves del paquete del proyecto, con fusion de resultados.
- Decodificacion restringida por gramatica (grammar-constrained decoding) disponible en el backend del proyecto para garantizar JSON valido.
- Compatibilidad con la chat template de Qwen2.5 y uso estandar con la libreria `transformers`.
- No dispone de capacidades multimodales, ni de tool calling nativo, ni de modo de razonamiento extendido; es un modelo especializado en una sola tarea.

## Casos de uso

- Due diligence contractual automatizada: un equipo legal puede procesar cientos de contratos de un data room y obtener automaticamente las clausulas de ley aplicable, fechas de expiracion y terminacion para revision posterior, a un coste de unos 0,002 USD por contrato.
- Gestion de renovaciones y vencimientos: extraccion de `expiration_date`, `renewal_term` y `notice_period_to_terminate_renewal` para alimentar sistemas de alertas de renovacion automatica en departamentos de procurement.
- Auditoria de riesgo en portfolios de contratos: identificacion masiva de clausulas de responsabilidad ilimitada (`uncapped_liability`), exclusividad, no competencia y cambios de control para cuantificar exposicion contractual.
- Migracion de datos a sistemas CLM (Contract Lifecycle Management): poblacion automatica de campos estructurados en plataformas de gestion contractual a partir de PDFs y textos de contratos legacy.
- Cumplimiento y compliance: deteccion de clausulas de asignacion de IP, licencias perpetuas o irrevocables y derechos de auditoria en acuerdos con proveedores para verificar politicas internas.
- Integracion en pipelines RAG legales: los JSON de salida pueden indexarse para construir buscadores semanticos sobre clausulas especificas de un corpus documental.
- Investigacion en NLP juridico: como baseline reproducible y ligero para experimentos de extraccion de clausulas, con protocolo de evaluacion y codigo publicados.

## Benchmarks y rendimiento

Evaluacion sobre 102 contratos del split de test oficial de CUAD, a nivel de documento. Un span se considera correcto cuando su similitud Jaccard a nivel de palabra con un span gold del mismo campo es al menos 0,5.

| Sistema | Span F1 (micro) | Span F1 (macro) | Presence F1 | Grounded spans | JSON utilizable | Latencia / contrato |
|---|---|---|---|---|---|---|
| **ClauseLM-Qwen2.5-1.5B** | **57,2** | **43,2** | **80,9** | 98,6% | 100% | 18,0 s |
| Qwen2.5-1.5B-Instruct, zero-shot | 11,7 | 3,9 | 49,9 | 43,5% | 100% | 21,0 s |
| Legal-BERT NER (token classification) | 42,7 | 30,2 | 80,8 | 100% | n/a | 0,08 s |
| Llama-3.2-3B + QLoRA (misma receta) | 61,7 | 50,4 | 83,8 | 97,4% | 100% | 27,5 s |

Mejores campos por F1: document name (87), governing law (86), expiration date (83), renewal term (83). Campos mas debiles: most favored nation (0, con solo 3 spans de test), non-disparagement (8), third party beneficiary (9), post-termination services (18).

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 3,1 GB solo de pesos en 16 bits; con contexto y sobrecoste de KV cache, cabe holgadamente en GPUs de 8 GB. El entrenamiento original (QLoRA 4 bits) se realizo en una GPU de 16 GB.
- GPU de referencia en la evaluacion: NVIDIA RTX 5080 (16 GB) con transformers en bf16, procesando todas las ventanas de un contrato en un solo batch.
- Cabe en GPUs de consumo: si; cualquier GPU moderna de 8-12 GB o mas (RTX 3060, RTX 4070, RTX 5080, etc.) es suficiente.
- Despliegue: `transformers` de forma nativa; compatible con text-generation-inference y endpoints de Hugging Face (tags `text-generation-inference` y `endpoints_compatible`). No hay pesos GGUF publicados en el repo indicado, por lo que el soporte via llama.cpp u Ollama no esta documentado.
- Latencia: 18 segundos por contrato completo (todas las ventanas en batch) en RTX 5080; throughput estimado derivado de los costes publicados: unos 200 contratos por hora en una sola GPU.
- Coste operativo: 0,0020 USD por contrato en alquiler on-demand (0,40 USD/hora de GPU) mas 0,00045 USD de electricidad (360 W a 0,25 USD/kWh).

## Comparativa con modelos similares

| Modelo | Parametros | Span F1 micro (CUAD) | Presence F1 | Latencia/contrato | Licencia |
|---|---|---|---|---|---|
| ClauseLM-Qwen2.5-1.5B | 1,54 B | 57,2 | 80,9 | 18,0 s | Apache 2.0 |
| Llama-3.2-3B + QLoRA (misma receta) | 3 B | 61,7 | 83,8 | 27,5 s | Licencia Llama (restricciones) |
| Legal-BERT NER | ~0,11 B | 42,7 | 80,8 | 0,08 s | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base, zero-shot) | 1,54 B | 11,7 | 49,9 | 21,0 s | Apache 2.0 |

Conclusiones de la comparativa: frente a Llama-3.2-3B con la misma receta, el modelo Qwen sacrifica unos 4,5 puntos de F1 micro a cambio de la mitad de parametros, menor latencia y una licencia Apache 2.0 sin restricciones. Frente a Legal-BERT NER, ofrece salidas JSON flexibles y ampliables (el NER no genera JSON) a costa de una latencia mucho mayor. Otros extractores legales especializados comparables no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con contratos en ingles (CUAD v1); el rendimiento sobre contratos en espanol o de otras jurisdicciones no esta garantizado y probablemente sea pobre.
- Campos con pocos ejemplos de test rinden muy mal o nada: most favored nation (F1 0 con solo 3 spans de test), non-disparagement (8), third party beneficiary (9) y post-termination services (18).
- Con un span F1 micro de 57,2, aproximadamente el 43% de los spans extraidos no supera el umbral de correccion: la salida requiere revision humana en flujos de trabajo criticos.
- El 1,4% de los spans no esta fundamentado (no es copia literal del contrato), por lo que conviene validar la correspondencia texto-salida en produccion.
- El modelo no debe usarse con penalty de repeticion ni con muestreo: la configuracion recomendada es greedy sin penalty, ya que la tarea requiere copiar texto literal.
- La longitud de contexto efectiva es de 4.096 tokens por ventana; los documentos largos dependen del chunking y la fusion del paquete del proyecto, que puede introducir errores de consolidacion entre fragmentos.
- Riesgo de alucinacion bajo pero no nulo: el diseno grounded lo mitiga, pero el modelo puede atribuir texto a campos incorrectos.
- Licencia Apache 2.0 sin restricciones para uso comercial, aunque los datos de entrenamiento (CUAD) tienen su propia licencia, que conviene revisar para productos derivados.
- Proyecto individual con 337 descargas y 2 likes: comunidad reducida, sin garantia de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Nadjib/ClauseLM-Qwen2.5-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Codigo, entrenamiento y evaluacion: https://github.com/Z-Nadjib/ClauseLM-ContractExtraction-CUAD
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Z-Nadjib/ClauseLM-demo
- Web del proyecto CUAD: https://www.atticusprojectai.org/cuad
