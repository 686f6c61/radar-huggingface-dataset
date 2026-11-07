# UtopiaIA/elffuss-prefixes

## Resumen

Elffuss precomputed prefixes es un repositorio de artefactos de caché, no un modelo de lenguaje. Contiene el estado precalculado de un system prompt fijo tras ser procesado por el modelo LFM3 1.7B (en cuantización QAD-Q4_0): las filas de la caché de atención (KV-cache) y el estado de la convolución corta, para un modelo y un formato de caché concretos. Lo desarrolla UtopiaIA, autor también del motor Elffuss Engine, y se publica bajo licencia Apache-2.0.

El problema que resuelve es el tiempo de espera hasta el primer token en entornos con poca capacidad de cómputo, como un navegador con WebGPU o una CPU móvil. Dado que el system prompt de una aplicación Elffuss nunca cambia, su estado interno tampoco cambia; descargarlo precalculado permite que la primera respuesta se salte la lectura completa del prompt, que en un teléfono o en CPU es la espera más larga antes de la primera palabra.

El repositorio es de tamaño reducido (0,1 GB) y contiene dos ficheros `.efp` correspondientes a dos system prompts (chat en español y chat en inglés) sobre el mismo modelo LFM3 1.7B en formato GGUF. No incluye pesos de modelo ni código de inferencia; el motor que consume estos ficheros es Elffuss Engine, publicado por separado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de caché (KV-cache y estado de convolución corta) para un transformer con convolución corta; no es un modelo |
| Parametros totales | no disponible (el modelo subyacente es LFM3 1.7B; el artefacto no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo de referencia es QAD-Q4_0; la caché se almacena en f32 (CPU) |
| Idiomas soportados | Español e inglés (según los dos system prompts incluidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.efp` (EFP1: cabecera u32 little-endian con longitud, cabecera JSON y partes crudas alineadas a 4 bytes); no contiene pesos, solo estado de caché |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un conjunto de estados precalculados. Cada fichero `.efp` almacena el resultado de procesar un system prompt fijo con el modelo LFM3 1.7B: las filas de la KV-cache y el estado de la convolución corta que caracteriza a la familia LFM. El formato EFP1 se compone de una cabecera de longitud u32 en little-endian, una cabecera JSON con metadatos y las partes crudas alineadas a 4 bytes.

La nomenclatura de cada fichero codifica el modelo, su tamaño, la precisión de la caché, si es CPU o GPU y los tokens exactos del prompt. El motor Elffuss Engine solo carga un fichero que coincida con lo que él mismo calcularía y lo verifica token a token antes de usarlo, lo que actúa como mecanismo de validación de integridad y coherencia. No hay información sobre datos de entrenamiento, RLHF ni innovaciones de decodificación, porque el artefacto no entrena nada.

## Capacidades

- Precarga de system prompt: permite omitir el procesamiento inicial del prompt del sistema en aplicaciones Elffuss.
- Reducción del tiempo hasta el primer token en CPU y en navegador con WebGPU.
- Verificación token a token por parte del motor antes de aceptar el fichero.
- Compatibilidad restringida a un modelo concreto (LFM3 1.7B QAD-Q4_0) y a un formato de caché concreto (CPU, f32).
- Soporte de dos system prompts: chat en español y chat en inglés.
- No incluye generación de texto, razonamiento, código ni tool calling por sí mismo; esas capacidades dependen del modelo LFM3 subyacente.

## Casos de uso

- IDE en navegador con agente local: en Elffuss Code, el agente arranca con un system prompt fijo; cargar el prefijo precalculado elimina la lectura inicial del prompt y reduce la latencia del primer token en WebGPU.
- Chat de asistencia en español sobre CPU: aplicaciones que ejecutan LFM3 1.7B en CPU pueden usar el fichero de system prompt en español para que la primera respuesta llegue antes.
- Chat de asistencia en inglés sobre CPU: mismo escenario con el fichero correspondiente al system prompt en inglés.
- Despliegue en dispositivos móviles: al ser el primer token la espera más larga en un teléfono, la precarga mejora la percepción de rapidez sin cambiar el modelo.
- Pruebas de integración del motor: los ficheros sirven para validar que Elffuss Engine comprueba token a token y rechaza prefijos que no coinciden con lo que calcularía.
- Distribución de configuraciones de agente: equipos que despliegan la misma aplicación Elffuss pueden distribuir el prefijo junto con la configuración para homogeneizar el arranque.
- Referencia de formato: implementaciones que necesiten leer o generar ficheros EFP1 pueden usar estos artefactos como ejemplo del formato documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de latencia, throughput ni comparativas de tiempo hasta el primer token.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto ocupa 0,1 GB en disco y no requiere VRAM por sí mismo, ya que la inferencia la realiza LFM3 1.7B.
- GPU recomendadas: no disponibles; el artefacto está etiquetado para ejecución en CPU con caché f32, y el ecosistema Elffuss apunta a WebGPU en navegador.
- GPU de consumo: no disponible; depende del modelo LFM3 1.7B QAD-Q4_0 y del soporte de WebGPU del navegador.
- Opciones de despliegue: Elffuss Engine (Apache-2.0, en GitHub); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card afirma cualitativamente que se evita la espera de lectura del system prompt, sin cifras.

## Comparativa con modelos similares

| Artefacto | Modelo asociado | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| Elffuss precomputed prefixes | LFM3 1.7B QAD-Q4_0 | KV-cache y estado de convolución corta de dos system prompts | Apache-2.0 | Hugging Face, 0 descargas |
| Caché de prompt de llama.cpp | Cualquiera soportado por llama.cpp | Estado de KV-cache generado localmente | MIT (llama.cpp) | Generación local, no distribuida |
| Prompt caching de proveedores en la nube | Modelos propietarios | Caché gestionada por el proveedor | Propietaria | Solo API del proveedor |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede usarse de forma autónoma; requiere LFM3 1.7B QAD-Q4_0 y Elffuss Engine.
- Acoplamiento estricto: el fichero solo es válido para un modelo, una cuantización, una precisión de caché (f32), una ruta (CPU) y unos tokens exactos.
- Cobertura limitada: solo hay dos system prompts, en español y en inglés; cualquier otro prompt requiere recalcular el prefijo.
- Sin métricas publicadas: no hay evidencia cuantitativa de la mejora de latencia ni de su comportamiento en distintos hardware.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Riesgo de obsolescencia: cambios en el motor, en el formato EFP1 o en el modelo invalidan los ficheros.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte.
- No se documentan sesgos ni riesgos de alucinación propios del artefacto; los hereda el modelo LFM3 subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UtopiaIA/elffuss-prefixes
- Elffuss Engine: https://github.com/utopia-ia/elffuss-engine
- Modelo LFM3 1.7B GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Elffuss Code (IDE en navegador): https://github.com/utopia-ia/elffuss-code
- Elffuss (núcleo de agente en navegador): https://github.com/utopia-ia/elffuss
