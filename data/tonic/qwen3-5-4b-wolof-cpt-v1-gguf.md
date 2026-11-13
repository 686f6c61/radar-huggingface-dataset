# Tonic/Qwen3.5-4B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-4B-Wolof-CPT-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-4B-Wolof-CPT-v1, un ajuste del modelo Qwen3.5 de 4B parámetros orientado al idioma wolof mediante continuación de preentrenamiento (CPT, continued pre-training). Lo publica el usuario Tonic en Hugging Face y está pensado para su uso con llama.cpp y herramientas compatibles con GGUF. El repositorio contiene únicamente los pesos cuantizados, no el modelo original en safetensors.

El modelo parte de una arquitectura Qwen3.5 con 4.860.696.576 parámetros totales (aproximadamente 4,86B), según los datos de safetensors del modelo base. La especialización en wolof lo hace relevante para aplicaciones de procesamiento de lenguaje natural en esta lengua de Senegal, donde los modelos multilingües generalistas suelen rendir por debajo de lo deseable. El tag `galsenai` sugiere vinculación con iniciativas de IA para Senegal.

La información publicada por el autor es muy escasa: la model card se limita a indicar el origen, las cuantizaciones disponibles (F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0) y un ejemplo de invocación con `llama-cli`. No se detallan datos de entrenamiento, licencia ni idiomas soportados más allá del wolof implícito en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles no disponibles |
| Parametros totales | 4.860.696.576 (~4,86B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (orientado a wolof por el nombre y los tags) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5 de aproximadamente 4,86B parámetros, por lo que se trata de un transformer decoder-only de la familia Qwen. El sufijo CPT-v1 indica que se ha aplicado continuación de preentrenamiento (continued pre-training) sobre el checkpoint Qwen3.5 original, presumiblemente con corpus en wolof, para adaptar el modelo a esa lengua. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de ajuste supervisado, RLHF o DPO.

La innovación principal es la especialización lingüística en wolof sobre una base Qwen3.5, empaquetada en GGUF para inferencia local eficiente. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas. El repositorio GGUF es una conversión del modelo base Tonic/Qwen3.5-4B-Wolof-CPT-v1, sin que el autor detalle el proceso de cuantización más allá de los cinco niveles publicados.

## Capacidades

- Generación de texto conversacional, con especial atención al wolof según el propósito declarado del modelo.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Ejecución local mediante llama.cpp y herramientas que consumen GGUF.
- Capacidades heredadas de Qwen3.5 (razonamiento, código, matemáticas, tool calling): no confirmadas explícitamente en la información disponible.
- Soporte multilingüe: no disponible más allá del wolof.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en esta lengua, aprovechando el ajuste CPT para mejorar la fluidez frente a un Qwen3.5 genérico.
- Traducción wolof-castellano o wolof-inglés: útil para servicios de traducción comunitaria, aunque la calidad en el par inverso dependerá de los datos de CPT no documentados.
- Atención al ciudadano en Senegal: despliegue local con llama.cpp en servidores modestos para responder consultas administrativas o sanitarias en wolof.
- Educación y alfabetización digital: generación de material didáctico y ejercicios en wolof para escuelas y programas de formación.
- Procesamiento de corpus en wolof: etiquetado, resumen o extracción de información de textos en esta lengua para investigación lingüística.
- Despliegue en hardware de consumo: al ser un modelo de ~4,86B en GGUF, puede ejecutarse en equipos con GPU modesta o incluso en CPU, facilitando prototipos sin infraestructura cloud.
- Integración en pipelines de datos: uso como generador de texto en flujos automatizados que requieran contenido en wolof.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximación según tamaño y cuantización, no confirmada por el autor):
  - F16: en torno a 9-10 GB.
  - Q8_0: en torno a 5-6 GB.
  - Q5_K_M: en torno a 3,5-4,5 GB.
  - Q4_K_M: en torno a 3-4 GB.
  - Q4_0: en torno a 3 GB.
- GPU recomendadas: no disponibles en la información del autor. Por tamaño, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter (A100, H100) sin problema, pero no está verificado.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más de VRAM en cuantizaciones Q4/Q5; no confirmado.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión Ollama u otros frontends compatibles con GGUF; vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-4B-Wolof-CPT-v1-GGUF | ~4,86B | no disponible | no disponible | GGUF | Especializado en wolof vía CPT |
| Qwen3.5-4B (base) | ~4,86B | no disponible | no disponible | safetensors/GGUF | Modelo generalista del que deriva |
| Modelos multilingües africanos (p. ej. variantes de AfroLM, LLaMA adaptados) | variable | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Model card muy escasa: no se documentan datos de entrenamiento, licencia ni idiomas oficialmente soportados.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegar en producción.
- Riesgo de alucinación inherente a los modelos de ~4,86B, especialmente en dominios especializados.
- Posibles sesgos derivados del corpus de CPT en wolof, cuya composición se desconoce.
- Capacidades multilingües no garantizadas fuera del wolof; el rendimiento en castellano u otras lenguas puede degradarse respecto al Qwen3.5 original.
- Longitud de contexto no documentada: planificar el despliegue con cautela.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- Los resultados de búsqueda web sobre "Tonic" no guardan relación con este modelo; no aportan información técnica adicional.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-CPT-v1
- llama.cpp: https://github.com/ggerganov/llama.cpp
