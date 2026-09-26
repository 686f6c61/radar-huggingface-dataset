# ZibinDong/ActionCodec2-2nd-order

## Resumen
ActionCodec2-2nd-order es un tokenizador de acciones de segundo orden publicado por el usuario ZibinDong en Hugging Face para robótica. No es un checkpoint de red neuronal: es un artefacto completo de codec que transforma una trayectoria continua de acciones de robot en tokens enteros y reconstruye una trayectoria aproximada al decodificar. Está pensado para entrenar o ejecutar políticas de robot autorregresivas y modelos VLA (vision-language-action), donde las acciones continuas deben discretizarse para poder tratarse como secuencias.

El artefacto está vinculado por defecto al espacio de acciones `single_eef_delta` (delta de posición y rotación del efector final más comando de pinza) y contiene perfiles ajustados tanto para articulaciones (`joint`) como para efector final (`eef`). Registra 13 layouts distintos, usa un presupuesto de 4096 tokens por perfil y fija un reloj objetivo de 15 Hz, remuestreando internamente cualquier frecuencia de origen que se indique con el parámetro `fps`.

Su relevancia actual es la de infraestructura de tokenización para robótica: al ser un codec de segundo orden necesita el incremento reconstruido de primer orden en cada frontera de chunk, lo que impone un contrato de uso concreto (`first_order_template`, `final_first_order`) que debe respetarse al integrarlo en un bucle de control por chunks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño declarado de 0.0 GB y no especifica licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador/codec de acciones de segundo orden (no es una red neuronal; incluye runtime Python propio) |
| Parametros totales | No disponible (el artefacto no contiene pesos de red neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; presupuesto de 4096 tokens por perfil |
| Tipos de cuantizacion | No disponible (no contiene pesos que cuantizar; la cuantizacion física de la accion es con perdida y propia del codec) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (artefacto compuesto por `router_config.yaml`, perfiles en `profiles/joint` y `profiles/eef`, `runtime/`, `processing_actioncodec2.py`, `config.json` y `processor_config.json`; no incluye safetensors ni GGUF) |

Datos adicionales declarados en la model card: orden de primitiva 2, espacio de accion seleccionado `single_eef_delta`, tasa del codec 15 Hz, perfiles ajustados `joint` y `eef`, presupuesto de tokens 4096 por perfil y 13 layouts registrados.

## Arquitectura y entrenamiento
El artefacto implementa un codec de acciones con primitiva de orden 2. Codifica una trayectoria (forma `(T, 7)` o lote `(B, T, D)`) a tokens enteros y decodifica tokens a una trayectoria aproximada, devolviendo un tensor `torch.float32` en CPU con forma `(B, T_out, D)`. La particularidad del segundo orden es que el codec requiere, en cada frontera de chunk, el incremento reconstruido de primer orden precedente: se obtiene con `first_order_template(batch_size=1)` para el arranque y se propaga con `final_first_order(tokens, previous_first_order=..., executed_steps=None)` tras ejecutar cada chunk. La librería no infiere esa frontera a partir de la primera acción, por lo que usar ceros solo es válido cuando se sabe que el movimiento previo era nulo.

El ajuste se realiza con la API `ActionCodec2(action_space=..., primitive_order=2)` y `codec.fit(episodes, fps=15, backend="auto", bootstrap_context=True)`; `bootstrap_context=True` emplea los dos primeros fotogramas medidos de cada episodio como contexto de ajuste, y el codec resultante se guarda con `save_pretrained` y se recarga mediante `AutoProcessor.from_pretrained(..., trust_remote_code=True)`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si hubo RLHF o DPO (no aplica en el sentido habitual, al no ser un modelo de lenguaje). La cuantización física y el remuestreo temporal son procesos con pérdida: la trayectoria decodificada es una aproximación y su número de pasos puede diferir del de entrada.

El layout por defecto `single_eef_delta` se define así: columnas 0:3 delta de posición del efector final (x, y, z) en metros por paso; columnas 3:6 incremento de rotación como vector de rotación en radianes, en sistema de referencia del cuerpo y siguiendo `R_next = R_previous @ Exp(rotvec)`; columna 6 comando de pinza, abierta cuando es >= 0.8 y cerrada en caso contrario. Las seis primeras columnas son incrementos por paso, no velocidades, y la pinza es un comando absoluto abierto/cerrado. Para layouts absolutos deben pasarse `current_state` y `previous_first_order` tanto en `encode` como en `decode`.

## Capacidades
- Tokenizacion de trayectorias continuas de robot a tokens enteros y decodificacion inversa a trayectoria aproximada.
- Soporte de multiples layouts de accion: 13 registrados, con perfiles ajustados para `joint` y `eef`, y variantes articulares, de doble brazo, absolutas y delta.
- Seleccion explicita de espacio de accion mediante `for_action_space(...)` (por ejemplo `single_joint6_delta`) e inspeccion de candidatos con `print_action_spaces(action_dim=7)`.
- Remuestreo temporal: acepta la frecuencia real de origen con `fps=...` (por ejemplo 30) y la adapta al reloj objetivo de 15 Hz.
- Gestion de fronteras entre chunks mediante el incremento de primer orden precedente, requisito para politicas autorregresivas y ejecucion por tramos.
- Procesamiento por lotes con `(B, T, D)`, con la restriccion de que todas las secuencias del lote compartan el mismo `T`.
- Integracion con el ecosistema Transformers mediante `AutoProcessor` y `trust_remote_code=True`, con runtime propio empaquetado en el artefacto.
- Ajuste de codecs propios sobre representaciones fisicas distintas con `primitive_order=2` y `bootstrap_context`.
- No incluye capacidades de generacion de texto, vision, audio, razonamiento, codigo, tool calling ni agentes: es un componente de tokenizacion, no un modelo generativo.

## Casos de uso
- Tokenizacion de acciones para políticas VLA: convertir trayectorias continuas de efector final en secuencias de enteros que un transformer autorregresivo pueda modelar como si fueran tokens de lenguaje, usando `encode` con `fps` y la frontera de primer orden adecuada.
- Compresión de datasets de robótica: reducir episodios de alta frecuencia a un vocabulario discreto de 4096 tokens por perfil, con remuestreo a 15 Hz, para almacenar y entrenar con secuencias manejables.
- Control por chunks en bucle cerrado: ejecutar un tramo decodificado y arrastrar la frontera con `final_first_order(tokens, previous_first_order=..., executed_steps=...)` antes de codificar el siguiente tramo, evitando discontinuidades en la trayectoria.
- Manipulación con pinza en tareas pick-and-place: aprovechar la columna de pinza con umbral 0.8 para representar apertura y cierre absolutos junto a los incrementos de posición y rotación del efector.
- Estandarización de datasets heterogéneos: ingestar datos grabados a 30 Hz y remuestrearlos al reloj de 15 Hz del codec para unificar varios orígenes en un mismo formato de tokens.
- Brazos articulados de 6-7 grados de libertad: cambiar al layout `single_joint6_delta` con `for_action_space` cuando el robot expone posiciones articulares en lugar de poses del efector final.
- Investigación en "action as language": tratar las acciones como vocabulario discreto para estudiar en modelos pequeños cómo se comporta el modelado autorregresivo de acciones frente al modelado continuo.
- Adaptación a nuevas representaciones físicas: reajustar el codec con `ActionCodec2(primitive_order=2)` y `fit(..., bootstrap_context=True)` cuando el robot, las unidades o la convención de rotación no coincidan con ningún layout registrado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Al no contener pesos de red neuronal, el artefacto no requiere GPU para funcionar: la carga y las operaciones de codificacion y decodificacion se ejecutan en CPU.
- VRAM estimada: no aplica; el consumo de memoria corresponde al tamaño de los datos de entrada y del vocabulario, no a pesos de modelo.
- GPU recomendadas: no aplica. Cualquier equipo capaz de ejecutar `numpy`, `scipy` y `torch` en CPU es suficiente.
- Compatibilidad con GPU de consumo: no aplica (no hay ventaja por usar una GPU para el codec en si).
- Opciones de despliegue: `transformers` con `AutoProcessor.from_pretrained(..., trust_remote_code=True)`, junto con las dependencias declaradas `numpy`, `scipy`, `torch`, `transformers>=4.57,<5`, `huggingface-hub` y `pyyaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos generativos.
- Latencia y throughput: no disponibles.
- Nota de integracion: el artefacto debe descargarse conservando todos los ficheros y directorios juntos (`router_config.yaml`, `profiles/`, `runtime/`, `processing_actioncodec2.py`, `config.json`, `processor_config.json`).

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad). El propio artefacto admite `primitive_order` configurable, lo que implica la existencia de una variante de primer orden dentro de la misma familia ActionCodec2, pero no se aportan métricas ni especificaciones de esa variante.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ActionCodec2-2nd-order | No aplica (codec) | No aplica; 4096 tokens por perfil | No disponible | No disponible | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- No es un modelo de lenguaje ni de visión: no genera texto, no razona, no hace tool calling y no tiene modo de pensamiento.
- La licencia no está especificada, por lo que el uso comercial queda sin cobertura explícita y requiere consultar al autor.
- Es un codec con pérdida: tanto la cuantización física como el remuestreo temporal distorsionan la trayectoria, y el número de pasos decodificados puede no coincidir con el de entrada.
- El codec no infiere la frontera de primer orden: si se pasa ceros cuando el movimiento previo no era nulo, la reconstrucción del arranque es incorrecta. Hay que usar `first_order_template` o arrastrar la frontera real.
- El layout por defecto es `single_eef_delta`; la forma de las acciones no basta para elegir un layout, hay que verificar orden de columnas, unidades, convención de rotación, convención de pinza y frecuencia de grabación del controlador o dataset.
- Las seis primeras columnas son incrementos por paso, no velocidades, y la rotación es en sistema de referencia del cuerpo con `R_next = R_previous @ Exp(rotvec)`; introducir features normalizadas genéricas en [-1, 1] rompe el contrato del espacio de acciones.
- Un lote debe compartir un único valor de `T`; los episodios de longitud variable deben codificarse por separado.
- Los layouts absolutos exigen pasar también `current_state` además de `previous_first_order` en `encode` y `decode`.
- No se documentan el dataset de ajuste ni el proceso de recolección de los perfiles `joint` y `eef`, por lo que no puede evaluarse el sesgo heredado de las trayectorias de origen.
- El repositorio declara 0 descargas y 0 likes y no incluye paper, demo ni evaluación publicada, lo que limita la validación independiente en producción.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ZibinDong/ActionCodec2-2nd-order
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
