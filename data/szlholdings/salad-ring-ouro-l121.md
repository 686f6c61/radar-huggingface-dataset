# SZLHOLDINGS/salad-ring-ouro-l121

## Resumen

`salad-ring-ouro-l121` es un artefacto de modelo publicado por SZLHOLDINGS bajo la etiqueta "governed-AI estate", una iniciativa que agrupa modelos, datasets y Spaces con resultados "receipted" (auditables) y trazabilidad a la fuente. El nombre del repositorio sigue un esquema interno de nomenclatura (`salad-ring-ouro-l121`) sin correspondencia con familias de modelos conocidas, y la model card no describe arquitectura, tamano, datos de entrenamiento ni capacidades concretas.

La informacion publica disponible es practicamente nula desde el punto de vista tecnico. La model card se limita a declarar la identidad del repositorio, enlazar a una organizacion de GitHub y mostrar graficos SVG deterministicos generados a partir de una instantanea de auditoria (2026-11-20T03:48:04Z, marcada como MEASURED). El autor indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion vive en "receipt files" externos y que lo no registrado alli es UNKNOWN.

Por tanto, esta ficha no puede confirmar que el modelo sea funcional, que tenga pesos disponibles, ni que exista un checkpoint entrenado. Cualquier evaluacion practica requiere inspeccionar directamente el repositorio de Hugging Face y los archivos de recibos referenciados en la organizacion de GitHub. La relevancia actual es limitada: se trata de un artefacto de gobernanza con trazabilidad declarada, no de un modelo con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida SSM/attention ni cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa, la tokenizer utilizada ni el vocabulario.

Respecto al entrenamiento, el autor remite a "receipt files" alojados en la malla (mesh) del estate, sin que la model card incluya numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas destacables. La unica afirmacion verificable es que los graficos de la card son SVG deterministicos generados por `szl-holdings/estate-cards weaver v0.1.0` a partir de una instantanea de auditoria con marca temporal, y que los numeros se etiquetan como MEASURED, REPORTED o UNKNOWN segun su origen.

## Capacidades

- No se documentan capacidades especificas de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, vision, audio, decodificacion especulativa).
- La unica capacidad declarada es la trazabilidad mediante recibos de auditoria y la honestidad explicita sobre lo no medido (UNKNOWN).

## Casos de uso

- Auditoria de artefactos de IA gobernada: el repositorio puede usarse como ejemplo de publicacion con recibos de auditoria y trazabilidad a la fuente, util para equipos que disenan pipelines de cumplimiento.
- Verificacion de procedencia de modelos: la estructura de la card (identidad, fuente canonica, evidencia, honestidad) sirve como plantilla para documentar modelos internos con marcas temporales y estados MEASURED/REPORTED/UNKNOWN.
- Integracion en pipelines de evaluacion: si los pesos existen y son accesibles, podrian cargarse en frameworks de evaluacion estandar, aunque no hay datos que confirmen compatibilidad con `transformers`, `vLLM` o `llama.cpp`.
- Reproducibilidad de graficos de auditoria: el generador determinista de SVG (`estate-cards weaver`) puede reutilizarse para producir informes reproducibles de otros artefactos.
- Investigacion sobre gobernanza de modelos: util para estudiar como se documentan (o no) los limites de informacion en model cards de nueva generacion.
- Uso educativo sobre model cards: ejemplo de card que declara explicitamente UNKNOWN en lugar de inventar datos, contraste util frente a cards con afirmaciones no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "ningun numero de benchmark se afirma en esta card mas alla de lo que una auditoria fechada haya medido", y no se incluye ninguno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que existan pesos en formato safetensors o GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque la informacion publica no permite determinar tamano, arquitectura ni tarea objetivo del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede verificar que el repositorio contenga pesos entrenados utilizables.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse reserva de derechos por defecto.
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni calidad en castellano.
- Riesgo de alucinacion: no evaluable sin acceso al modelo y sin benchmarks.
- Sesgos conocidos: no documentados.
- La model card remite a "receipt files" externos no enlazados directamente en la pagina; la verificabilidad efectiva depende de que esos recibos sean publicos y accesibles.
- El nombre del modelo y el esquema de nomenclatura no corresponden a ninguna familia conocida, lo que dificulta su integracion en ecosistemas estandar.
- Cero descargas y cero likes en el momento de la consulta: sin senales de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l121
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del estate (referenciado en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
