# TheShellMaster/cypher-Huihui-Qwen3.5-2B-abliterated

## Resumen

`cypher-Huihui-Qwen3.5-2B-abliterated` es un espejo público del archivo GGUF `Huihui-Qwen3.5-2B-abliterated.Q5_K_M.gguf`, publicado por el usuario TheShellMaster. No se trata de un modelo entrenado ni afinado por el autor del repositorio: es una copia bit a bit (verificada con hash SHA-256) de la cuantización Q5_K_M generada por mradermacher a partir de la versión abliterada de huihui-ai, que a su vez deriva del modelo raíz Qwen/Qwen3.5-2B.

El modelo es un transformer denso de 2,3 mil millones de parámetros con arquitectura `qwen35` y una ventana de contexto nativa de 262 144 tokens. La abliteración aplicada por huihui-ai elimina la dirección de rechazo del espacio de activaciones, lo que produce un modelo "uncensored" que no declina peticiones por motivos de seguridad. El interés práctico del repositorio es la distribución de un artefacto listo para llama.cpp en un tamaño de 1,42 GB, pensado para ejecutarse en entornos con 2 vCPU y sin GPU.

La relevancia es acotada: el repositorio tiene cero descargas y cero likes en el momento de la ficha, y su propia model card lo describe como "un punto de distribución redundante". Su valor está en la trazabilidad de la genealogía y en la verificación criptográfica del binario, no en aportar capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer denso) |
| Parametros totales | 2,3 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | Q5_K_M (~5,4 bits/peso); referencia del autor: Q4_K_M ≈ 4,8, Q6_K ≈ 6,6, Q8_0 ≈ 8,5 bits/peso |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q5_K_M, 1 424 769 472 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso identificado en los metadatos como `qwen35`, con 2,3 mil millones de parámetros y 262 144 tokens de contexto nativo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo raíz Qwen3.5-2B en la documentación proporcionada.

La innovación técnica relevante no está en el entrenamiento sino en el postprocesado. La abliteración de huihui-ai opera en fp16 sobre el modelo raíz: identifica la dirección de activación asociada al comportamiento de rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de activar respuestas de negativa. Sobre esa versión, mradermacher aplica una cuantización K-quant mixta por bloques de 256 pesos, con mayor precisión en las capas de atención que en las FFN, resultando en una media de 5,3 a 5,7 bits por peso. El espejo de TheShellMaster no reintroduce cambios: no hay re-cuantización, ni fine-tuning, ni modificación de plantilla de chat.

## Capacidades

- Generación de texto en francés e inglés, los dos idiomas declarados en la model card.
- Conversación multi-turno con ventana de contexto de 262 144 tokens, aunque en la práctica limitada por la RAM y la configuración de `num_ctx` del runtime.
- Comportamiento "uncensored": no activa rechazos por contenido, consecuencia directa de la abliteración.
- Ejecución en CPU pura mediante llama.cpp, sin requisito de GPU.
- Integración con Ollama mediante `Modelfile` para despliegue local.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Distribución verificable de artefactos: el repositorio sirve como réplica con hash SHA-256 publicado, útil para pipelines que necesitan validar la integridad del binario antes de desplegarlo en producción.
- Despliegue en Spaces gratuitos de Hugging Face: con 1,42 GB en disco y Q5_K_M, el modelo está dimensionado explícitamente para 2 vCPU, lo que permite ofrecer una demo de generación de texto sin coste de GPU.
- Prototipado rápido en local: un desarrollador puede descargar el GGUF con `hf download` y ejecutarlo con `llama-cli` en un portátil sin GPU para validar prompts e integraciones antes de escalar a un modelo mayor.
- Experimentación con modelos abliterados: investigadores que estudian el efecto de la eliminación de la dirección de rechazo disponen de una cadena completa y trazable (raíz, abliteración, cuantización, espejo) para reproducir experimentos.
- Generación de texto en francés para entornos con recursos mínimos: el modelo declara soporte de `fr`, lo que permite tareas de redacción o resumen en ese idioma sobre hardware modesto.
- Base para fine-tuning ligero: al ser apache-2.0 y de 2,3 B, puede servir como punto de partida para ajustes con LoRA en tareas específicas, siempre que el equipo asuma las implicaciones de partir de una base sin alineación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el formato distribuido; el archivo Q5_K_M ocupa 1,42 GB en disco y requiere aproximadamente esa cantidad de RAM más el espacio del contexto KV.
- GPU recomendadas: no se especifican. El autor orienta el artefacto a CPU (2 vCPU), no a aceleración por GPU.
- GPU de consumo: al ser un GGUF de 1,42 GB, cabría en cualquier GPU con 4 GB o más de VRAM mediante offload de capas (`-ngl`), aunque no hay datos publicados de rendimiento en ese escenario.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama mediante `Modelfile`. No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Huihui-Qwen3.5-2B-abliterated | 2,3 B | 262 144 | apache-2.0 | GGUF Q5_K_M | Espejo sin modificar; sin benchmarks publicados |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated | 2,3 B | 262 144 | apache-2.0 | safetensors (fp16) | Fuente de la abliteración; permite re-cuantizar |
| mradermacher/Huihui-Qwen3.5-2B-abliterated-GGUF | 2,3 B | 262 144 | apache-2.0 | GGUF (múltiples quants) | Origen del archivo Q5_K_M; ofrece más niveles de cuantización |
| Qwen/Qwen3.5-2B | 2,3 B | 262 144 | no disponible en la información | no disponible | Modelo raíz con alineación de seguridad intacta |

## Limitaciones y advertencias

- La abliteración elimina los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal o sesgado sin filtro. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación elevado por el tamaño (2,3 B) y por la pérdida de precisión de la cuantización Q5_K_M; no debe usarse como fuente de verdad en dominios factuales.
- Idiomas limitados a francés e inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- El contexto nativo de 262 144 tokens es teórico: en la práctica, el runtime y la RAM disponible determinan un `num_ctx` mucho menor (el ejemplo del autor usa 8192).
- La licencia apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por una base sin alineación.
- El repositorio es un espejo sin mantenimiento declarado; ante divergencia, la fuente oficial es mradermacher o huihui-ai.
- Cero descargas y cero likes implican ausencia de validación comunitaria sobre el binario más allá del hash publicado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/TheShellMaster/cypher-Huihui-Qwen3.5-2B-abliterated
- Modelo base (abliterado): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Cuantizaciones GGUF de origen: https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-GGUF
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-2B
