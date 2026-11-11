# ThakiCloud/Thaki-PII-NER-KoEn-v2-Preview

## Resumen

Thaki-PII-NER-KoEn-v2-Preview es un clasificador de tokens (token classification) desarrollado por ThakiCloud que detecta y etiqueta fragmentos de datos personales (PII) y nombres de organizaciones en textos en coreano e inglés. Se construye mediante fine-tuning del modelo base jhu-clsp/mmBERT-base, un transformer de arquitectura ModernBERT con 307.557.155 parámetros totales, y produce 35 etiquetas en formato BIO que cubren 17 tipos de entidad distintos (AGE, BANK_ACCOUNT, CREDIT_CARD, DATE_OF_BIRTH, DATE_TIME, EMAIL, ID_NUMBER, IP, LOCATION, NRP, ORG, PERSON, PERSONAL_ATTRIBUTE, PHONE, URL, USERNAME, VEHICLE).

El modelo resuelve un problema concreto en el ámbito de los guardrails y la seguridad de aplicaciones LLM: la detección y el enmascaramiento de información sensible antes o después de que un texto pase por un sistema de generación. Está etiquetado con los tags `pii`, `ner`, `llm-guard` y `guardrails`, lo que indica su orientación a pipelines de moderación y protección de datos. Al ser un modelo encoder-only de tipo token-classification, ofrece una alternativa más ligera y determinista que el uso de un LLM generativo para tareas de redacción de PII.

Es relevante ahora por su enfoque bilingüe coreano-inglés, un par de idiomas menos cubierto por las herramientas habituales de detección de PII, y por su publicación como *research preview* con un protocolo de evaluación explícito y preregistrado. No obstante, el propio autor lo marca como no aprobado para producción: el veredicto oficial de la pista es RELEASE_HOLD, la evaluación independiente en coreano es INCONCLUSIVE y la medición de coste en CPU está COST_BLOCKED.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning de jhu-clsp/mmBERT-base |
| Parametros totales | 307.557.155 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la inferencia usa ventanas de 1.000 caracteres con 200 de solapamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | pesos y config CC BY-SA 4.0; codigo wrapper MIT (license: other) |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER / PII) |
| Etiquetas | 35 etiquetas BIO, 17 tipos de entidad |
| Modelo base | jhu-clsp/mmBERT-base @ revision c5955035435e2bf121cde7f3c8863ef52ff35d82 |
| Tokenizer | no incluido en el repo; se carga desde jhu-clsp/mmBERT-base |
| Tamano del repo | 1,2 GB |
| Libreria | transformers |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde jhu-clsp/mmBERT-base (licencia MIT) y ajustado para token classification con 35 etiquetas BIO. La cabeza de clasificación emite etiquetas por token que luego se agrupan en spans mediante la estrategia `aggregation_strategy="simple"` del pipeline de Hugging Face, con atención eager, ventanas de 1.000 caracteres y 200 de solapamiento, umbral de score ≥ 0,5, fusión de spans solapados del mismo tipo, recorte de espacios y unión de fragmentos de PERSON y LOCATION separados solo por espacios en blanco. Estas reglas están fijadas en `pii_ner_profile.json`.

El entrenamiento se realizó en dos etapas. La etapa 1 (interna, no publicada) usó exclusivamente datos sintéticos de PII: train de K-PII-Bench, train de Nemotron-PII y Gretel synthetic PII finance en inglés. La etapa 2, que corresponde a este checkpoint (brazo "R2", semilla 42), continuó desde la etapa 1 sobre texto NER etiquetado por humanos combinado con los mismos datos sintéticos en proporción 2:1 (64.000 ventanas reales : 32.000 sintéticas), con ratio coreano:inglés de 1:1. El texto real proviene de KLUE-NER train (coreano) y Few-NERD supervised train (inglés). El autor declara que no se usaron datos de AI-Hub, ni datos generados por LLM, ni APIs de pago, y que el brazo y la regla de selección se preregistraron antes del entrenamiento. El archivo de pesos tiene sha256 `51f6ba5806282dbc2289d24760236165618abbbcb1938a31abc6ace7702f423a`.

## Capacidades

- Detección de spans de PII en coreano e inglés con 17 tipos de entidad: AGE, BANK_ACCOUNT, CREDIT_CARD, DATE_OF_BIRTH, DATE_TIME, EMAIL, ID_NUMBER, IP, LOCATION, NRP (nacionalidad, grupo religioso o político), ORG, PERSON, PERSONAL_ATTRIBUTE, PHONE, URL, USERNAME y VEHICLE.
- Redacción (enmascaramiento) de spans detectados mediante el método `redact()` del wrapper; en esta preview los spans de tipo ORG no se enmascaran por defecto y son solo de revisión.
- Etiquetado a nivel de token con salida en formato BIO, apto para pipelines de guardrails y llm-guard.
- Procesamiento por ventanas de 1.000 caracteres con solapamiento de 200, lo que permite procesar documentos de longitud arbitraria.
- Capacidad bilingüe coreano-inglés, sin soporte declarado para otros idiomas.
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso. No tiene visión, audio ni modo de pensamiento.

## Casos de uso

- Enmascaramiento de PII en pipelines de LLM: el modelo puede ejecutarse como paso previo a un prompt para sustituir nombres, correos, teléfonos y tarjetas por marcadores antes de enviar el texto a un proveedor externo, reduciendo la exposición de datos personales.
- Redacción de logs y trazas de aplicaciones: integrado en el pipeline de logging, detecta y enmascara IPs, cuentas bancarias y números de identificación antes de persistir los registros.
- Moderación y guardrails en coreano: cubre un idioma con poca oferta de herramientas de detección de PII, útil en productos dirigidos al mercado surcoreano.
- Preprocesado de datasets para entrenamiento: permite filtrar o anonimizar corpus bilingües antes de usarlos en fine-tuning de otros modelos.
- Cumplimiento normativo en flujos de atención al cliente: detección de datos sensibles en transcripciones de chat o correo para su redacción antes del almacenamiento o la revisión humana.
- Enmascaramiento en formularios y documentos financieros: los tipos BANK_ACCOUNT, CREDIT_CARD e ID_NUMBER permiten redactar extractos o justificantes antes de su compartición interna.
- Revisión de contenido generado: detección de PII que un LLM haya podido introducir en una respuesta antes de mostrarla al usuario final.

## Benchmarks y rendimiento

Métrica: strict span F1 (un span es correcto solo si inicio, fin y tipo coinciden exactamente con el gold; media micro sobre todos los spans). "Common 8" restringe el scoring a PERSON, EMAIL, PHONE, CREDIT_CARD, IP, ID_NUMBER, BANK_ACCOUNT y CRYPTO; este modelo no tiene etiqueta CRYPTO, por lo que no se puntúa en esa categoría.

Conjuntos de desarrollo (500 documentos por set, semilla fija 1104, mismos documentos para todos los modelos):

| Celda | Conjunto y tipo | F1 |
|---|---|---|
| KO PII | K-PII-Bench dev oficial, common 8, sintético in-distribution | 0,9911 |
| KO PII, todos los tipos | mismo conjunto, todos los tipos | 0,9778 |
| EN PII | Nemotron-PII, split held-out del train, common 8, sintético | 0,9749 |
| EN PII | Gretel synthetic PII finance, held-out, common 8, sintético | 0,8466 |
| KO ORG | KLUE-NER, parte held-out del train (usado para elegir el brazo, optimista) | 0,8246 |
| EN ORG | Few-NERD validación oficial, misma fuente que el train | 0,6929 |

Splits held-out de las mismas fuentes de entrenamiento (misma fuente, no independientes):

| Celda | Conjunto | F1 |
|---|---|---|
| KO ORG | KLUE-NER validación oficial (muestra de 2.000 frases) | 0,7805 |
| EN ORG | Few-NERD test oficial (muestra de 2.000 frases) | 0,7185 |
| KO PII, todos los tipos | K-PII-Bench, mismo generador que el train | 0,9778 |

El autor advierte que estos números son de desarrollo y provienen de las distribuciones de las propias fuentes de entrenamiento; no son evidencia de calidad sobre texto de otras distribuciones. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307,5 M de parámetros, en fp32 ocupa aproximadamente 1,2 GB de pesos, y en fp16/bf16 alrededor de 0,6 GB, más el overhead de activaciones y del tokenizer externo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder alojarlo en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque el fabricante no publica requisitos oficiales.
- Opciones de despliegue: el wrapper oficial usa `transformers` con el pipeline `token-classification`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al ser un modelo encoder-only de clasificación, los servidores orientados a generación no son el entorno natural.
- Latencia y throughput: la medición de coste en CPU está marcada como COST_BLOCKED (no medida en un benchmark aislado). No hay cifras de latencia ni throughput publicadas.
- Versiones probadas: Python 3.11, torch 2.9.0 (CPU), transformers 4.51.3, tokenizers 0.21.4, huggingface_hub 0.36.2. Otras versiones no fueron testadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Idiomas | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Thaki-PII-NER-KoEn-v2-Preview | 307,5 M | ko, en | Token classification (PII/NER) | CC BY-SA 4.0 (pesos) + MIT (código) | Research preview, RELEASE_HOLD, tokenizer externo |
| jhu-clsp/mmBERT-base | no disponible en la informacion | multilingüe (no detallado) | Encoder base | MIT | Modelo base del que deriva este checkpoint |
| Alternativas de detección de PII | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables concretos en la información proporcionada |

## Limitaciones y advertencias

- Estado de research preview: el autor declara explícitamente que no está aprobado para release ni para uso en producción, con veredicto RELEASE_HOLD.
- Evaluación independiente en coreano marcada como INCONCLUSIVE y medición de coste en CPU como COST_BLOCKED.
- Los benchmarks publicados son de desarrollo y provienen de las mismas fuentes que el entrenamiento; no demuestran generalización a otras distribuciones de texto.
- El repositorio no contiene el tokenizer; debe cargarse desde jhu-clsp/mmBERT-base en la revisión fijada, con sus propios términos. Por ello el widget de inferencia alojado no funciona.
- Riesgo de alucinación y de falsos positivos/negativos en la detección de spans: es un clasificador, no un generador, pero sus errores de etiquetado pueden provocar redacciones incorrectas o fugas de PII no detectada.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos sintéticos y con KLUE-NER y Few-NERD, puede heredar los sesgos de esas fuentes.
- Limitaciones de idioma: solo coreano e inglés; no hay soporte declarado para otros idiomas.
- Restricciones de licencia: los pesos son CC BY-SA 4.0 (share-alike, requiere atribución y compartir bajo la misma licencia las obras derivadas) y el código wrapper es MIT; el tokenizer externo mantiene sus propios términos. Es necesario revisar LICENSE.md y NOTICE.md antes de cualquier uso comercial.
- Los spans de tipo ORG no se enmascaran por defecto en esta preview y son solo de revisión.
- Cualquier cambio en las reglas de decodificación fijadas en `pii_ner_profile.json` invalida los números publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-PII-NER-KoEn-v2-Preview
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Model card en coreano (referenciada): MODEL_CARD.ko.md dentro del repositorio
- Licencia (referenciada): LICENSE.md dentro del repositorio
- Aviso de fuentes y licencias (referenciado): NOTICE.md dentro del repositorio
- Perfil de decodificación (referenciado): pii_ner_profile.json dentro del repositorio
