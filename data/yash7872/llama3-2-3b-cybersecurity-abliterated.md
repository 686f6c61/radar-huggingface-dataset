# Yash7872/Llama3.2-3b-cybersecurity-abliterated

## Resumen

Llama3.2-3b-cybersecurity-abliterated es un ajuste fino (fine-tuning) del modelo Llama 3.2 3B Instruct de Meta, especializado en ciberseguridad y sometido a un proceso de "abliteration" (eliminacion o atenuacion de las capas de rechazo alineadas). Lo publica el usuario Yash7872 en Hugging Face, partiendo del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/llama-3.2-3b-instruct-bnb-4bit`), y lo entrena con cuatro conjuntos de datos orientados a instrucciones de seguridad informatica.

El modelo resuelve el problema de disponer de un asistente local, ligero y sin filtros de rechazo para tareas de analisis de seguridad, formacion y laboratorio. Su tamano de 3.212.749.888 parametros (aproximadamente 3,2 mil millones) permite ejecutarlo en hardware de consumo, y su ventana de contexto heredada de Llama 3.2 es de 128.000 tokens.

Es relevante ahora por dos motivos: la proliferacion de modelos "abliterated" para investigacion ofensiva y defensiva, y la posibilidad de desplegarlo en formato GGUF mediante llama.cpp u Ollama sin depender de infraestructura en la nube. La licencia declarada es Apache 2.0, aunque conviene revisar las condiciones de la licencia Llama 3.2 de la que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), fine-tuning con Unsloth |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.2: 128.000 tokens) |
| Tipos de cuantizacion | checkpoint base en 4 bits (bnb-4bit); pesos GGUF publicados en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.888 parametros. El punto de partida es `unsloth/llama-3.2-3b-instruct-bnb-4bit`, es decir, una version del instruct de Meta cuantizada en 4 bits mediante bitsandbytes y preparada por Unsloth para entrenamiento con QLoRA. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, lo que el autor describe como un entrenamiento "2x mas rapido".

Los datos de entrenamiento proceden de cuatro conjuntos publicos: `AlicanKiraz0/Cybersecurity-Dataset-Heimdall-v1.1`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, `luckwa/cybersecurity-dataset` y `WhoIsShe/CyberSecurityBooks-PDF`. No se especifican el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores. El componente "abliterated" implica la modificacion de las direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo ante solicitudes relacionadas con seguridad ofensiva.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Razonamiento y explicacion de conceptos de ciberseguridad: vulnerabilidades, vectores de ataque, mitigaciones y analisis de configuraciones.
- Respuesta a instrucciones tecnicas sin los rechazos habituales del modelo base alineado (comportamiento "abliterated").
- Soporte de conversaciones multi-turno mediante plantilla de chat de Llama 3.2.
- Capacidad de ejecucion local en CPU y GPU gracias a los pesos GGUF incluidos.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de vision, audio ni modo "thinking" explicito.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Formacion en seguridad ofensiva en laboratorios controlados: el modelo puede explicar tecnicas de reconocimiento, explotacion y post-explotacion sin los filtros del modelo base, lo que resulta util en entornos de aprendizaje con aislamiento de red.
- Analisis de configuraciones y hardening: se le pueden pegar fragmentos de configuracion (nginx, sshd, politicas IAM) y solicitar una revision de riesgos y recomendaciones concretas.
- Redaccion de informes de pentesting: genera borradores de hallazgos, descripciones de vulnerabilidades y recomendaciones de remediacion a partir de notas tecnicas.
- Asistente local de consulta para analistas SOC: al ejecutarse en local con llama.cpp u Ollama, permite consultar procedimientos y tecnicas MITRE ATT&CK sin enviar datos a servicios externos.
- Generacion de contenido educativo y CTFs: creacion de escenarios, pistas y explicaciones para retos de captura de la bandera.
- Automatizacion de triaje de alertas: clasificacion y resumen de eventos de seguridad en pipelines internos, con la ventaja de que el modelo cabe en una GPU de consumo.
- Investigacion sobre alineacion y seguridad: analisis comparativo del comportamiento de un modelo abliterated frente a su version alineada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en cuantizacion Q4_K_M (GGUF), 3-4 GB en Q8_0 y unos 6,5 GB en FP16.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para cuantizaciones altas (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, Text Generation Inference (TGI), transformers con bitsandbytes.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama3.2-3b-cybersecurity-abliterated | 3,2 B | no disponible (heredado 128k) | apache-2.0 | Hugging Face, pesos safetensors y GGUF |
| Llama 3.2 3B Instruct (Meta) | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, amplia disponibilidad |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento publicados para el modelo abliterated que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion de rechazos aumenta el riesgo de generar contenido ofensivo, instrucciones daninas o material dual-use sin advertencias. No es adecuado para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion elevado: al ser un modelo de 3B ajustado sobre datos especificos, puede inventar CVE, comandos o procedimientos plausibles pero incorrectos.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Datos de entrenamiento: no se documentan el volumen de tokens, la calidad ni la procedencia detallada de los datasets, lo que dificulta evaluar sesgos y cobertura.
- Licencia: aunque se declara Apache 2.0, el modelo deriva de Llama 3.2, cuya licencia comunitaria impone restricciones adicionales (por ejemplo, la clausula de "construido con Llama" y limites de usuarios mensuales para ciertos usos). Conviene verificar la compatibilidad antes de uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Adopcion practicamente nula: 0 descargas y 1 "like" en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yash7872/Llama3.2-3b-cybersecurity-abliterated
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Dataset AlicanKiraz0/Cybersecurity-Dataset-Heimdall-v1.1: https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-Heimdall-v1.1
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset luckwa/cybersecurity-dataset: https://huggingface.co/datasets/luckwa/cybersecurity-dataset
- Dataset WhoIsShe/CyberSecurityBooks-PDF: https://huggingface.co/datasets/WhoIsShe/CyberSecurityBooks-PDF
