# sprapp-com/sage-a15-refusal-tuned-encrypted

## Resumen

sage-a15-refusal-tuned-encrypted es un artefacto publicado en Hugging Face por el usuario sprapp-com que, según su propia model card, consiste en una release de pesos cifrados con AES-256-CTR. No se trata de un modelo utilizable de forma directa: el repositorio contiene ficheros cifrados y un `MANIFEST.tsv` con los vectores de inicialización (IV) por fichero, pero la clave maestra del proyecto no está incluida. Sin esa clave, y sin el manifiesto, el contenido no se puede descifrar.

El nombre sugiere un modelo orientado a "refusal tuning" (ajuste para rechazar peticiones) con una variante identificada como "a15", pero no hay información pública que confirme arquitectura, número de parámetros, contexto ni datos de entrenamiento. El tamaño del repositorio es de 71,9 GB, lo que es compatible con pesos en safetensors de un modelo de decenas de miles de millones de parámetros, aunque el cifrado impide verificar la estructura real de los tensores.

La relevancia de esta ficha es principalmente práctica: sirve para documentar que el artefacto existe, qué contiene según su autor y por qué no es desplegable tal cual. Cualquier evaluación técnica, benchmark o uso en producción queda bloqueado hasta que el autor publique la clave maestra o una versión descifrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cifrados con AES-256-CTR (según la model card) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura. El repositorio no incluye `config.json` legible, tokenizer ni documentación técnica más allá de las instrucciones de descifrado. El único dato estructural es el esquema de cifrado: cada fichero se cifra con AES-256-CTR usando una clave maestra externa y un IV distinto por fichero, registrado en `MANIFEST.tsv`. El comando de descifrado de la model card recorre ese manifiesto y aplica `openssl enc -d -aes-256-ctr` con `-K "$KEYHEX"` e `-iv "$iv"`.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO o algún otro proceso de alineamiento. El sufijo "refusal-tuned" apunta a un ajuste específico para gestionar rechazos, pero no se especifica metodología, conjunto de datos ni métricas.

## Capacidades

- No verificables: al no poder descifrar los pesos, no es posible confirmar generación de texto, razonamiento, código, matemáticas ni visión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- El nombre sugiere un comportamiento de rechazo ("refusal") ante determinadas peticiones, pero no hay evidencia pública de cómo se implementa ni de su alcance.

## Casos de uso

- Archivo y custodia de pesos: el repositorio puede usarse como almacenamiento cifrado de una release interna, siempre que el equipo custodie la clave maestra y el `MANIFEST.tsv` por separado.
- Distribución controlada a socios: un tercero con la clave y el manifiesto puede reconstruir los pesos localmente sin exponerlos en texto plano en el repositorio.
- Verificación de integridad: el manifiesto permite comprobar que los ficheros cifrados corresponden a los originales esperados antes de descifrar.
- Auditoría de cadena de custodia: útil en entornos donde se exige demostrar que los pesos no han estado accesibles sin cifrar.
- Reproducción de un pipeline de descifrado: el fragmento de shell de la model card sirve como referencia para montar un script de descifrado en CI.
- Formación interna: ejemplo didáctico de release cifrada con AES-256-CTR y gestión de IV por fichero.

En ningún caso estos usos implican inferencia: sin clave no hay modelo ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño real del modelo, que no se puede determinar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles mientras los pesos estén cifrados.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 71,9 GB, por lo que se necesita espacio en disco equivalente para el cifrado y, tras el descifrado, espacio adicional para los pesos en claro.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se puede determinar la categoría, el tamaño ni las capacidades del modelo a partir de la información pública.

## Limitaciones y advertencias

- El repositorio no es utilizable sin la clave maestra del proyecto; la clave no está incluida y el autor indica explícitamente que la clave por sí sola es insuficiente sin el `MANIFEST.tsv`.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido.
- No hay idiomas declarados ni pipeline asignado, por lo que no se puede confirmar su idoneidad para ninguna tarea.
- El cifrado AES-256-CTR no proporciona autenticación por sí mismo; la integridad depende de verificaciones externas sobre el manifiesto.
- Riesgo de alucinación y sesgos: no evaluables sin acceso a los pesos.
- Cualquier uso en producción queda bloqueado hasta que el autor publique una versión descifrada, una clave o documentación técnica verificable.
- El nombre "refusal-tuned" sugiere un comportamiento de rechazo que podría limitar respuestas en dominios sensibles, pero no hay documentación que lo confirme.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sprapp-com/sage-a15-refusal-tuned-encrypted
