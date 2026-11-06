# XanaxLord/LFM3-1.7B-MNN

## Resumen

LFM3-1.7B-MNN es una conversión al formato MNN (Alibaba Mobile Neural Network) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario XanaxLord bajo la marca TokForge. Se trata de una versión cuantizada a int4 (block size 32, HQQ) pensada exclusivamente para inferencia en dispositivos móviles a través de la aplicación TokForge, disponible para Android (Google Play) e iOS (TestFlight). No es un modelo nuevo ni un fine-tuning: es una redistribución del modelo original de Liquid AI en un contenedor optimizado para ejecución local en teléfonos.

El modelo base, LFM3 1.7B, emplea una arquitectura híbrida característica de Liquid AI: 13 capas de convolución corta, 6 capas de atención completa y 5 de atención con ventana deslizante, con GQA de 16 cabezas de consulta y 4 de clave/valor. Esta combinación mantiene bajo el consumo de memoria en conversaciones largas, ya que la mayoría de las capas no requieren un KV cache completo. El vocabulario es de 128.000 tokens y el tamaño del repositorio es de 1,3 GB, lo que refleja la compresión int4 de los pesos.

Su relevancia es acotada: se dirige a desarrolladores que quieran probar el modelo en el ecosistema TokForge sin pasar por el proceso de conversión a MNN. No aporta mejoras de rendimiento respecto al original, no publica benchmarks propios y su licencia hereda las restricciones de la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 hybrid: 13 capas de convolución corta, 6 de atención completa y 5 de atención con ventana deslizante; GQA 16Q/4KV |
| Parametros totales | 1,7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con block size 32, HQQ |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, llm.mnn.json) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 1,3 GB |
| Modelo base | LiquidAI/LFM3-1.7B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del LFM3 1.7B original de Liquid AI: un transformer híbrido en el que la mayoría de las capas son convoluciones cortas y solo una minoría (6 de atención completa y 5 de ventana deslizante) mantienen atención clásica. Esta distribución reduce el coste de memoria del KV cache en contextos largos, que es precisamente lo que hace viable su ejecución en un teléfono. La atención usa GQA con 16 cabezas de consulta y 4 de clave/valor, lo que reduce aún más el estado a almacenar.

No se dispone de información sobre el proceso de entrenamiento del modelo original en la documentación proporcionada: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta la innovación técnica del modelo base más allá de la descripción arquitectónica. La conversión a MNN incluye los pesos int4 con HQQ, el embedding y la cabeza de salida atados en el mismo fichero de pesos, y un tokenizer en formato `tokenizer.mtok`.

## Capacidades

- Generación de texto y conversación general en inglés, según la descripción del autor ("good general chat and instruction following").
- Seguimiento de instrucciones en formato chat, con plantilla incluida en `llm_config.json`.
- Inferencia local sin conexión a internet, dentro de la app TokForge.
- Eficiencia en conversaciones largas gracias a las capas de convolución corta, que reducen el coste de memoria frente a un transformer de atención completa.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Chat privado en el dispositivo: la app TokForge ejecuta el modelo localmente sin enviar datos a servidores, adecuado para conversaciones con información sensible en un teléfono Android o iOS.
- Asistentes sin conectividad: al no requerir internet, sirve para escenarios de campo, viajes o entornos con red restringida donde se necesite generación de texto.
- Pruebas de concepto de inferencia on-device: permite a un desarrollador evaluar el comportamiento de LFM3 1.7B en un móvil sin montar un pipeline de conversión a MNN propio.
- Prototipado de aplicaciones móviles con LLM integrado: el formato MNN y el runtime de TokForge sirven como referencia para medir latencia y consumo en hardware real.
- Generación de texto de bajo coste en inglés: tareas de redacción breve, resumen o reformulación que no requieran contexto muy largo ni razonamiento complejo.
- Evaluación comparativa de cuantización int4: útil para estudiar la pérdida de calidad de HQQ con block size 32 frente a los pesos originales en fp16/bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para memoria unificada de dispositivos móviles. Con pesos int4 y 1,7B de parámetros, el fichero de pesos ocupa aproximadamente 1,3 GB, por lo que se necesita al menos ese espacio libre más el overhead del runtime MNN.
- GPU recomendadas: no disponible. El despliegue objetivo es el runtime MNN en SoC móviles (Qualcomm, MediaTek, Apple Silicon en iOS) a través de TokForge.
- Compatibilidad con GPU de consumo: no está documentada la ejecución en RTX 4090, A100, H100 ni similares; el formato MNN no es el habitual para esas plataformas.
- Opciones de despliegue: TokForge 1.3.9.7 o superior (Android vía Google Play, iOS vía TestFlight). El runtime subyacente es MNN de Alibaba. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MNN (este) | 1,7B | no disponible | MNN int4 | lfm1.0 | Hugging Face, app TokForge |
| LiquidAI/LFM3-1.7B (original) | 1,7B | no disponible | safetensors | lfm1.0 | Hugging Face |
| Alternativas on-device de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo original de Liquid AI, del que este es una conversión cuantizada. No se dispone de datos de benchmarks ni de otras alternativas on-device en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- La cuantización int4 con HQQ y block size 32 introduce degradación respecto a los pesos originales en fp16/bf16; no se han publicado mediciones de esa pérdida.
- Riesgo de alucinación inherente a un modelo de 1,7B: baja capacidad de razonamiento y de verificación factual frente a modelos mayores.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial; es necesario revisar el fichero `LICENSE` antes de integrarlo en un producto. El campo `license: other` de Hugging Face refleja esa condición.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado sin historial de mantenimiento; no hay garantía de soporte ni de actualizaciones.
- Dependencia de la app TokForge 1.3.9.7 o superior: el modelo no es utilizable con runtimes estándar de Hugging Face sin una conversión adicional.
- No se documenta la longitud de contexto efectiva del modelo convertido, lo que impide planificar aplicaciones con ventanas largas.
- El autor de la conversión es un usuario independiente (XanaxLord), no Liquid AI; la responsabilidad sobre la integridad de los pesos recae en el publicador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XanaxLord/LFM3-1.7B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- MNN (Alibaba) en GitHub: https://github.com/alibaba/MNN
