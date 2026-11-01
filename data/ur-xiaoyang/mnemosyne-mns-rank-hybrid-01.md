# UR-xiaoyang/mnemosyne-mns-rank-hybrid-01

## Resumen

MNEMOSYNE-MNS-RANK-HYBRID-01 es un componente de ranking (reranking) para sistemas de memoria de agentes, publicado por el usuario UR-xiaoyang en HuggingFace. No es un modelo generativo ni un transformer entrenado de extremo a extremo: es un bundle de despliegue que combina un encoder congelado (`intfloat/multilingual-e5-small`) con características estructuradas (similitud coseno TF-IDF, solapamiento léxico, rasgos de longitud y de señal) y un ranker de regresión logística por pares. El artefacto principal es un fichero `joblib` con el vectorizador TF-IDF ajustado y los parámetros del ranker en JSON.

El problema que resuelve es la selección y ordenación de recuerdos candidatos dentro de un pipeline de memoria de agentes (MNEMOSYNE-MNS), donde el runtime recupera un conjunto amplio de fragmentos y este componente decide cuáles son más relevantes para una consulta dada. Su relevancia radica en que es un bundle portable, ejecutable en CPU, con licencia MIT y diseñado para despliegue offline en entornos aislados, lo que facilita integrarlo en infraestructuras sin GPU.

El tamaño del repositorio es de 0,5 GB, dominado por el snapshot local del encoder E5-small. La model card declara resultados en el split público de validación de AlpsBench (312 consultas), pero no se especifican parámetros totales del transformer subyacente ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder transformer congelado (E5-small) + características estructuradas (TF-IDF coseno, solapamiento léxico, longitud, señales) + regresión logística por pares |
| Parametros totales | no disponible (el encoder E5-small subyacente no se detalla en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el encoder se distribuye como snapshot local; no se documentan cuantizaciones) |
| Idiomas soportados | multilingüe y chino según tags; lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | `joblib` (artefacto de runtime Python), `ranker.json`, `scaler.json`, `metadata.json`, `manifest.json` y snapshot del encoder en `e5_model/` (safetensors) |

## Arquitectura y entrenamiento

El sistema es un pipeline de ranking en dos etapas. Primero, un encoder congelado `intfloat/multilingual-e5-small` produce representaciones semánticas de consulta y candidato. En paralelo, se calculan características estructuradas: similitud coseno TF-IDF, solapamiento léxico y de contención, y rasgos de longitud y de señal (cue features). Todas estas señales se estandarizan con los parámetros de `scaler.json` y se combinan mediante un ranker de regresión logística por pares cuyos coeficientes se exportan en `ranker.json` para despliegue portable.

El entrenamiento se realizó únicamente con el split público de train de AlpsBench, según declara la model card. No se subieron historiales de conversación privados ni etiquetas débiles privadas al repositorio. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica a un ranker lineal de este tipo). La innovación destacable es la portabilidad: el bundle incluye un manifiesto con hashes SHA-256 y tamaños en bytes, y admite carga offline con `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`.

## Capacidades

- Ranking y reranking de fragmentos de memoria para consultas de agentes.
- Extracción de características de similitud semántica mediante encoder multilingüe congelado.
- Cálculo de similitud léxica y solapamiento de tokens complementario al embedding.
- Ejecución en CPU; GPU opcional.
- Despliegue offline en entornos aislados (air-gapped).
- Soporte multilingüe heredado del encoder E5-small y etiquetado explícito de chino.
- Integración con el runtime MNEMOSYNE-MNS (API, almacén SQLite, lógica de ruta/escritura/actualización/conflicto/ensamblado).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo.

## Casos de uso

- Reranking de recuerdos en agentes conversacionales: el componente recibe los candidatos recuperados por el runtime MNEMOSYNE-MNS y los reordena combinando similitud semántica y léxica, mejorando la precisión de los recuerdos que se inyectan en el contexto del agente.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con un encoder small, encaja en servidores modestos o contenedores sin aceleración hardware.
- Sistemas con requisitos de aislamiento de red: el bundle admite carga offline completa, útil en instalaciones on-premise con restricciones de conectividad.
- Búsqueda híbrida sobre memorias de proyecto: la combinación de TF-IDF y embeddings captura tanto coincidencias exactas de términos como paráfrasis, adecuada para bases de conocimiento técnico con vocabulario específico.
- Filtrado previo en pipelines de recuperación aumentada: puede actuar como etapa intermedia entre el retrieval inicial y la generación, reduciendo el número de fragmentos enviados al modelo generativo.
- Evaluación y depuración de sistemas de memoria: al exponer parámetros lineales en JSON y un manifiesto con hashes, facilita la auditoría y la reproducibilidad de resultados de ranking.
- Soporte multilingüe en memorias de agentes: el encoder E5-small permite manejar consultas y candidatos en varios idiomas, con atención particular al chino según los tags.

## Benchmarks y rendimiento

Resultados declarados en el split público de validación de AlpsBench (312 consultas):

| Metrica | Valor |
|---|---:|
| Recall@1 | 0,4071 |
| Recall@5 | 0,6699 |
| Recall@10 | 0,7756 |
| MRR | 0,5287 |
| NDCG@10 | 0,5796 |

No se han publicado resultados comparativos con otros modelos de ranking en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; con GPU opcional, el encoder E5-small es ligero y cabe holgadamente en GPUs de consumo, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponibles; el diseño prioriza CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con varios GB de VRAM, dado el tamaño del encoder small (no se detalla cifra exacta).
- Opciones de despliegue: runtime propio de MNEMOSYNE-MNS con `joblib`, `transformers` y carga offline mediante variables de entorno; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplica a un ranker).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNEMOSYNE-MNS-RANK-HYBRID-01 | Ranker híbrido (encoder + logística) | no disponible | no disponible | MIT | HuggingFace |
| `intfloat/multilingual-e5-small` | Encoder de embeddings | no disponible en la información | no disponible | MIT (según el modelo original) | HuggingFace |
| Rerankers basados en cross-encoder (p. ej. familia BGE reranker) | Cross-encoder | no disponible | no disponible | variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El benchmark de AlpsBench no sustituye trazas reales de tipo `retrieved -> cited -> corrected`; el rendimiento en producción puede diferir.
- Los filtros de alcance, autoridad y validez los aporta el runtime MNEMOSYNE-MNS, no se aprenden en este bundle.
- Es un componente de ranking, no una base de datos de memoria ni un agente completo.
- Riesgo de sesgo heredado del encoder E5-small y del dataset AlpsBench, no evaluado en la información disponible.
- No se documentan limitaciones de contexto ni de idioma concretas; la cobertura multilingüe depende del encoder subyacente.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del encoder `intfloat/multilingual-e5-small` incluido en el snapshot.
- Al ser un ranker lineal sobre características, puede tener menor capacidad de generalización que un cross-encoder entrenado de extremo a extremo en dominios muy distintos al de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UR-xiaoyang/mnemosyne-mns-rank-hybrid-01
- Encoder base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del proyecto MNEMOSYNE-MNS: no disponible en la información proporcionada
- Paper o blog de AlpsBench: no disponible en la información proporcionada
