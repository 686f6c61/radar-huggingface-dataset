# Tonic/Qwen3.5-2B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-2B-Wolof-CPT-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-2B-Wolof-CPT-v1, un ajuste del modelo base Qwen3.5 de 2B parámetros orientado al idioma wolof mediante entrenamiento continuo (continued pre-training, CPT). Lo publica el usuario Tonic, que también mantiene el modelo base en formato safetensors, y está pensado para su uso con llama.cpp y entornos compatibles con GGUF.

El modelo resuelve el problema de la escasa representación del wolof en los LLM generalistas: parte de un modelo Qwen3.5 de 2B parámetros (2.405.781.312 parámetros totales) y lo adapta al wolof, idioma hablado principalmente en Senegal. La relevancia actual radica en que ofrece una opción ligera y cuantizable para aplicaciones de generación de texto en wolof que pueden ejecutarse en hardware modesto.

La información publicada es muy escasa: la model card solo indica que es una exportación GGUF con cuantizaciones F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0, y proporciona un ejemplo de uso con `llama-cli`. No se detallan datos de entrenamiento, licencia ni idiomas soportados más allá de la etiqueta wolof.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 2.405.781.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (etiqueta wolof; idiomas del modelo base no detallados) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 12,3 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una exportación GGUF del checkpoint Tonic/Qwen3.5-2B-Wolof-CPT-v1, que a su vez deriva de la familia Qwen3.5. Por la nomenclatura "CPT" (continued pre-training) se infiere que el ajuste al wolof se realizó mediante entrenamiento continuo sobre el modelo base, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

No se dispone de información sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, modos de razonamiento) ni sobre la arquitectura interna exacta más allá de su origen en Qwen3.5. La model card se limita a documentar el proceso de cuantización y un comando de ejemplo.

## Capacidades

- Generación de texto conversacional en wolof, según la etiqueta del modelo y el ejemplo de la model card.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Cuantización a varios niveles (F16 hasta Q4_0), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso en infraestructuras de inferencia estándar.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en este idioma, aprovechando el ajuste CPT sobre Qwen3.5 para responder en un idioma poco cubierto por los modelos generalistas.
- Traducción asistida wolof-francés: Senegal es un país francófono con gran población wolof parlante; un modelo ligero puede servir como base para prototipos de traducción en entornos con recursos limitados.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M o Q4_0, el modelo de 2B parámetros puede ejecutarse en hardware de consumo, útil para aplicaciones offline en zonas con conectividad limitada.
- Educación y alfabetización digital: generación de material didáctico o respuestas a preguntas frecuentes en wolof para plataformas educativas locales.
- Atención al ciudadano: chatbots de información pública (salud, trámites) en wolof, desplegables con llama.cpp en servidores modestos.
- Investigación lingüística: base para experimentos de evaluación de LLM en lenguas africanas de bajos recursos, comparando el efecto del CPT frente al modelo base Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, según tamaño de pesos): F16 ~4,8 GB; Q8_0 ~2,6 GB; Q5_K_M ~1,7 GB; Q4_K_M ~1,5 GB; Q4_0 ~1,4 GB. Estas cifras son estimaciones por tamaño de parámetros y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de consumo con al menos 4-6 GB de VRAM para cuantizaciones bajas, pero no está confirmado.
- Cabe en GPU de consumo: probable en cuantizaciones Q4/Q5 según el tamaño de pesos; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (ejemplo oficial con `llama-cli`), y por extensión herramientas compatibles con GGUF como Ollama o servidores llama.cpp. vLLM y TGI no están confirmados para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (ajustes en wolof de tamaño similar) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: no se documentan datos de entrenamiento, licencia ni idiomas exactos, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base Qwen3.5 y del checkpoint Tonic antes de desplegarlo.
- Riesgo de alucinación inherente a los modelos de 2B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Cobertura lingüística limitada: el ajuste se centra en wolof; el rendimiento en otros idiomas dependerá del modelo base y no está documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar la configuración del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora del CPT frente al Qwen3.5 base en wolof.
- Repo con 0 descargas y 0 likes en el momento de la consulta: modelo sin validación comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-CPT-v1
- llama.cpp: https://github.com/ggml-org/llama.cpp
