# Zyrabit-IA/zyra-guide-Q5_K_M

## Resumen

Zyra Guide es un modelo de lenguaje pequeño (SLM) de 3,09 mil millones de parámetros, cuantizado en formato Q5_K_M y basado en la arquitectura Qwen2.5-3B. Ha sido desarrollado por Zyrabit Architecture Labs con un enfoque específico en pipelines de agentes empresariales que requieren soberanía de datos y ejecución en entornos aislados (air-gapped). El modelo se distribuye como un archivo GGUF de 2,2 GB, listo para inferencia local con llama.cpp u otras herramientas compatibles.

La relevancia de este modelo reside en su orientación hacia sectores regulados (banca, salud, gobierno) que necesitan desplegar IA generativa sin comprometer la privacidad de los datos. Incluye características como generación de JSON válida al 100 %, tasa de fuga de PII del 0 % y verificación de aislamiento de red con 0 bytes de tráfico saliente. El modelo está optimizado para aceleración en NPU Tenstorrent Blackhole, aunque también puede ejecutarse en CPU y GPU convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B (Transformer, no MoE) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Q5_K_M |
| Idiomas soportados | en, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B, un transformer denso con atención estándar, entrenado originalmente por Alibaba. Zyrabit ha realizado un fine-tuning específico para tareas de agente empresarial, aunque no se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni técnicas como RLHF o DPO. El modelo se distribuye directamente en formato cuantizado Q5_K_M, lo que reduce el tamaño a 2,2 GB y facilita su ejecución en hardware modesto.

El entrenamiento se ha orientado a la adherencia a instrucciones (IFEval 88,5 %) y a la precisión en dominios específicos (94,2 %). También se ha optimizado para la generación de JSON válido y la redacción de PII, con una tasa de fugas declarada del 0 %. No hay información disponible sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación de múltiples turnos en inglés y español.
- Cumplimiento de instrucciones de alto nivel (88,5 % en IFEval strict prompt).
- Generación de salida estructurada en JSON con validación de esquema al 100 %.
- Diseñado para pipelines de agentes empresariales con integración vía API REST o CLI.
- Capacidad de ejecución en entornos aislados (air-gapped) sin conexión a internet, con verificación de 0 bytes de tráfico saliente.
- Reducción de fugas de PII a cero en las pruebas del autor, adecuado para entornos con datos sensibles.

## Casos de uso

- **Atención al cliente automatizada en banca**: el modelo puede gestionar consultas de clientes en español e inglés, redactando respuestas y estructurando la información en JSON para integrarse con sistemas de CRM. Su tasa de fuga PII del 0 % permite tratar datos financieros sin riesgo de exposición.
- **Asistente de documentación clínica**: en entornos hospitalarios, el modelo puede redactar informes de pacientes en local, garantizando que los datos de salud permanezcan en las instalaciones (air-gapped) y cumpliendo con normativas de privacidad.
- **RAG sobre documentos internos**: al ser un modelo pequeño, se puede desplegar en servidores locales para consultas sobre bases de conocimiento corporativas, con respuestas estructuradas en JSON para su integración en flujos de trabajo.
- **Generación de informes estructurados**: gracias a su capacidad de generar JSON válido al 100 %, es útil para crear informes automáticos, resúmenes de reuniones o formularios normalizados en sistemas de gestión.
- **Agentes de automatización de procesos**: en entornos de TI, el modelo puede actuar como agente de orquestación que recibe instrucciones y devuelve respuestas en formato JSON, facilitando la integración con sistemas de automatización.
- **Chatbot bilingüe para servicios públicos**: con soporte en español e inglés, puede desplegarse en ayuntamientos o entidades públicas para responder preguntas frecuentes, manteniendo los datos de los ciudadanos en infraestructura local.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de HuggingFace (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Domain Test Accuracy | 94,2 % |
| Instruction Following (IFEval) | IFEval Strict Prompt | 88,5 % |

Además, la documentación del autor reporta en el hardware Tenstorrent Blackhole NPU (p150): un throughput de 1672,22 pasos/segundo en fine-tuning, una latencia P95 de 142,5 ms, una conformidad con esquema JSON del 100 % y una tasa de fuga de PII del 0 %. Estos datos provienen de pruebas propias de Zyrabit y no han sido reproducidos por terceros.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo GGUF Q5_K_M ocupa 2,2 GB, por lo que se recomienda un mínimo de 3 GB de VRAM para el modelo y el contexto, aunque puede variar según la longitud de la secuencia.
- **GPUs compatibles**: puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060, RTX 4060, GTX 1660 o superiores con al menos 4 GB de VRAM. También es compatible con NPUs Tenstorrent Blackhole, como se indica en el benchmark del autor.
- **Opciones de despliegue**: llama.cpp (llama-cli), API REST compatible con OpenAI (endpoints_compatible), CLI de Zyrabit (./zyra) y posiblemente vLLM si se convierte a safetensors, aunque no está documentado.
- **Latencia y throughput**: según el autor, la latencia P95 en NPU Tenstorrent es de 142,5 ms y el throughput de 1672,22 pasos/segundo durante el fine-tuning. No se proporcionan datos para GPU convencionales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de tamaño similar (p. ej., Qwen2.5-3B base, Llama 3.2 3B, Phi-3-mini). El modelo es una variante fine-tune y cuantizada de Qwen2.5-3B, por lo que su rendimiento en tareas generales será probablemente inferior al del modelo base en algunos benchmarks estándar, pero superior en tareas de dominio específico según los datos del autor. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, al igual que el modelo base.

## Limitaciones y advertencias

- Los benchmarks reportados (Domain Test Accuracy e IFEval) están marcados como no verificados (verified: false) por el propio autor, por lo que deben tomarse con cautela.
- Al ser un SLM de 3,1 B, su capacidad de razonamiento complejo y generación de código avanzada es limitada en comparación con modelos de 7B o más.
- La longitud de contexto no se ha especificado en la información disponible; se asume la del modelo base Qwen2.5-3B (32 768 tokens), pero no está confirmada.
- El modelo está optimizado para inglés y español; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir con la licencia del modelo base Qwen2.5 (también Apache-2.0) y cualquier otra restricción de terceros.
- No se han publicado detalles sobre el proceso de fine-tuning (datos, técnicas de alineación), lo que dificulta evaluar su robustez en escenarios adversos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zyrabit-IA/zyra-guide-Q5_K_M
- Organización Zyrabit-IA en HuggingFace: https://huggingface.co/Zyrabit-IA
- Organización Zyrabit en GitHub: https://github.com/Zyrabit-tech
- Documentación oficial de Zyrabit: https://docs.zyrabit.com/docs/
