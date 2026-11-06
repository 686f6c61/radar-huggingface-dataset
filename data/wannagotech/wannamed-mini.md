# WannaGoTech/WannaMed-mini

## Resumen

WannaMed-mini es un modelo unificado de la empresa WannaGoTech (Francia) orientado a uso clínico en el borde (edge): combina reconocimiento automático de voz (ASR) médico en tiempo real, estructuración de informes clínicos y respuesta a prompts médicos en un único grafo neuronal. Está diseñado para ejecutarse íntegramente sin conexión en smartphones iOS y Android mediante LiteRT, con un consumo declarado de 1,12 GB de RAM activa a partir de pesos maestros BF16 de 9,45 GB.

El modelo declara 4.954.625.747 parámetros en pesos maestros, de los cuales 2,35B son parámetros PLE (per-layer embeddings) proyectados en memoria Flash mediante mmap. Deriva de una "decoupe chirurgicale sans perte" (recorte sin pérdida) de WannaMed Monet, del que se eliminaron 659 tensores visuales (-321,56 MB en BF16), fusionando las capacidades de WannaMed ASR v2 (1,7B) y WannaMed Tx (4B).

Su relevancia actual radica en la propuesta de inferencia médica 100 % offline en dispositivo, con transcripción por ventanas causales de 480 ms, estructuración de informes sobre 329 plantillas XML y cobertura de 12 especialidades clínicas, sin depender de la nube ni de motores RAG externos. La licencia es "other" y el acceso a los pesos maestros requiere solicitud por correo al autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer unificado multimodal (ASR + generación de texto) con per-layer embeddings (PLE); derivado de WannaMed Monet tras eliminar 659 tensores visuales |
| Parámetros totales | 4.954.625.747 en pesos maestros BF16 (9,45 GB); 2,35B corresponden a parámetros PLE |
| Parámetros activos | No disponible (no se declara como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos maestros BF16 y formato LiteRT para despliegue en dispositivo; no se detallan otras cuantizaciones |
| Idiomas soportados | Francés (fr), inglés (en), árabe (ar) |
| Licencia | other (acceso a pesos bajo solicitud) |
| Formato de pesos | BF16 (pesos maestros) y LiteRT (despliegue edge) |

## Arquitectura y entrenamiento

WannaMed-mini es un transformer unificado que integra en un solo grafo neuronal las capacidades de dos modelos previos de la familia: WannaMed ASR v2 (1,7B) para reconocimiento de voz y WannaMed Tx (4B) para generación y estructuración de texto clínico. El modelo se obtiene mediante un recorte sin pérdida de WannaMed Monet, del que se retiran 659 tensores visuales (-321,56 MB en BF16). La innovación estructural más destacable son los per-layer embeddings (PLE): 2,35B de parámetros proyectados en memoria Flash mediante mmap, lo que permite mantener un modelo de casi 5B parámetros con solo 1,12 GB de RAM activa en un smartphone.

El ASR opera en modo causal por ventanas de 480 ms, lo que habilita transcripción en streaming en tiempo real. El modelo incorpora además un módulo de desambiguación quirúrgica de homófonos con 41.744 reglas declaradas y un sistema de estructuración sobre 329 plantillas XML de informes clínicos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) médico y radiológico en tiempo real, con ventanas causales de 480 ms.
- Estructuración de informes clínicos (CR) sobre 329 plantillas XML, incluyendo generación de conclusiones.
- Desambiguación quirúrgica de homófonos en transcripción médica (41.744 reglas declaradas).
- Respuesta a prompts clínicos en 12 especialidades, con validación de posología y planes de acción.
- Generación de texto clínico y formato audio-text-to-text.
- Capacidades multilingües en francés, inglés y árabe.
- Ejecución 100 % offline en dispositivo (iOS y Android) mediante LiteRT, sin Cloud ni RAG externo.
- Modo de "zero-overcorrection" orientado a preservar identidad y lateralidad en la transcripción.
- No se declara soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Dictado médico al lado del paciente: el modelo transcribe voz en ventanas causales de 480 ms con 0,54 % CER declarado, lo que permite documentar la consulta en tiempo real sin conexión a internet y sin enviar audio a la nube.
- Redacción automática de informes radiológicos: a partir de la transcripción, estructura el contenido sobre 329 plantillas XML con 99,76 % F1 declarado, reduciendo el tiempo de redacción posterior a la exploración.
- Verificación de posología en modo avión: el modelo responde a prompts clínicos en 12 especialidades con validación de planes de acción, útil en entornos sin conectividad (zonas rurales, quirófanos, urgencias).
- Corrección de homófonos en terminología quirúrgica: el módulo de desambiguación con 41.744 reglas corrige términos confundibles en la transcripción, con 99,70 % F1 declarado, reduciendo errores en nombres de procedimientos y fármacos.
- Asistente clínico en dispositivos de gama media: con 1,12 GB de RAM activa vía LiteRT, puede desplegarse en smartphones iOS y Android convencionales para consulta rápida de protocolos y planes de acción.
- Triage y soporte documental multilingüe: al cubrir francés, inglés y árabe, puede emplearse en entornos clínicos con pacientes o personal sanitario multilingüe para transcripción y estructuración de notas.
- Formación médica y simulación: permite practicar dictado de informes y recibir estructuración automática en un entorno local, sin exposición de datos clínicos a servicios externos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| ASR médico y radiológico en tiempo real (480 ms causal) | WannaMed Unseen Doctor Audio Hold-Out (0 % leakage) | Clinical Token Accuracy | 98,81 % |
| ASR médico y radiológico en tiempo real (480 ms causal) | WannaMed Unseen Doctor Audio Hold-Out (0 % leakage) | CER | 0,54 % |
| ASR médico y radiológico en tiempo real (480 ms causal) | WannaMed Unseen Doctor Audio Hold-Out (0 % leakage) | WER | 0,91 % |
| Estructuración de informes clínicos (329 plantillas XML) | WannaMed-CR-Struct-FR Hold-Out (0 % leakage) | F1 (estructuración y conclusión) | 99,76 % |
| Desambiguación quirúrgica de homófonos | WannaMed-CR-Struct-FR Hold-Out (0 % leakage) | F1 | 99,70 % |
| Zero-overcorrection (identidad y lateralidad) | WannaMed-CR-Struct-FR Hold-Out (0 % leakage) | Accuracy | 100 % |
| QA clínico en 12 especialidades (posología y planes de acción) | WannaMed-12-Specialties-FR | Accuracy | 100 % |
| QA clínico (FrenchMedMCQA) | FrenchMedMCQA | Accuracy | 83,4 % |

El autor declara además comparaciones frente a Whisper Large-v3 (+10,6 puntos en ASR, 88,2 %), OpenBioLLM-8B (+22,9 puntos en desambiguación de homófonos, 76,8 %) y BioMistral-7B, así como una retención del 99,29 % respecto al dúo servidor WannaMed ASR 1.7B + WannaMed Tx 4B. Estas cifras proceden de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- RAM activa en dispositivo: 1,12 GB según el autor, gracias a los 2,35B parámetros PLE proyectados en memoria Flash vía mmap.
- Pesos maestros: 9,45 GB en BF16, necesarios para despliegue en servidor o para conversión a LiteRT.
- Despliegue edge: smartphones iOS y Android mediante LiteRT; el autor no detalla modelos mínimos de dispositivo.
- Despliegue en servidor: no se especifican GPU recomendadas (A100, H100, RTX 4090) ni VRAM estimada para inferencia en BF16.
- Opciones de despliegue: LiteRT para dispositivo; compatibilidad con transformers declarada en los tags; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput declarados: 105 tok/s y TTFT inferior a 28 ms en el escenario edge descrito por el autor.
- No se indica si el modelo cabe en GPU de consumo en formato BF16 completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WannaMed-mini | 4,95B totales (2,35B PLE) | No disponible | ASR médico + estructuración de informes + QA clínico, edge offline | other (acceso bajo solicitud) | Pesos maestros BF16 y LiteRT bajo solicitud |
| Whisper Large-v3 | No disponible en la información | No disponible | ASR generalista | No disponible en la información | Público |
| OpenBioLLM-8B | 8B | No disponible | LLM biomédico | No disponible en la información | Público |
| BioMistral-7B | 7B | No disponible | LLM biomédico | No disponible en la información | Público |
| WannaMed ASR v2 + WannaMed Tx 4B | 1,7B + 4B (dúo servidor) | No disponible | ASR + generación clínica en servidor/PC | No disponible en la información | Familia WannaGoTech |

La comparación se limita a los datos aportados por el autor; no se dispone de especificaciones de contexto, cuantización ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; no hay validación independiente publicada.
- El modelo está especializado en francés clínico; el rendimiento en inglés y árabe no se cuantifica en la información disponible.
- Licencia "other": el uso comercial y el acceso a los pesos maestros requieren solicitud explícita a contact@wannamed.com; no se detallan condiciones.
- Riesgo de alucinación inherente a la generación de texto clínico; las métricas de estructuración y QA no eliminan la necesidad de revisión por un profesional sanitario.
- El modo "zero-overcorrection" se declara al 100 % en identidad y lateralidad, pero se basa en el conjunto hold-out del propio autor.
- No se especifican sesgos conocidos, composición del dataset de entrenamiento ni número de tokens utilizados.
- No se declara soporte de tool calling, function calling ni razonamiento agéntico multi-paso, lo que limita su integración en pipelines automatizados complejos.
- La longitud de contexto no está publicada, lo que impide evaluar su idoneidad para documentos clínicos extensos.
- El tamaño del repositorio en Hugging Face es de 0,0 GB; los pesos no están disponibles públicamente en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WannaGoTech/WannaMed-mini
- Demo interactiva (Space): https://huggingface.co/spaces/WannaGoTech/WannaMed-mini
- Edición Pro con visión 2D/3D, ECG y MedOCR (WannaMed Monet): https://huggingface.co/WannaGoTech/WannaMed-Monet
- WannaMed ASR v2 (1,7B): https://huggingface.co/WannaGoTech/WannaMedASR
- WannaMed Tx (4B): https://huggingface.co/WannaGoTech/WannaMed-Tx
- Dataset de benchmark ASR clínico francés: https://huggingface.co/datasets/WannaGoTech/WannaMedASR-French-Clinical-Benchmark
- Sitio oficial de WannaMed: https://wannamed.com
- Sitio de la empresa: https://wannago.tech
- Contacto para licencia y acceso a pesos: contact@wannamed.com
