# southleft/altitude-a2ui-e2b-litertlm

## Resumen

Altitude A2UI es un ajuste fino del modelo `google/gemma-4-E2B-it` de Google, desarrollado por Southleft, especializado en generar interfaces de usuario como JSON estructurado. El modelo recibe una descripcion en ingles de una interfaz (por ejemplo, "una pagina de ajustes para un termostato inteligente con programacion y modo ausente") y devuelve un layout A2UI que referencia componentes reales del design system Altitude por sus nombres de etiqueta (`al-card`, `al-button`, `al-tabs`). El objetivo es permitir que agentes de IA construyan interfaces reales sobre un catalogo de componentes concreto y verificado, sin inventar componentes inexistentes.

Su rasgo mas distintivo es el despliegue: se distribuye como un unico archivo de 2,14 GiB en formato `.litertlm` (LiteRT-LM) cuantizado a int8, que se ejecuta integramente dentro de una pestana de navegador sobre WebGPU, sin servidor ni clave de API. El mismo archivo funciona en Android y mediante la linea de comandos de LiteRT-LM. La generacion de salida no es ejecutable: el host renderiza el layout con su propia libreria de componentes.

Tecnicamente parte de la familia Gemma 4 (5,1 B de parametros segun la model card) y ha sido ajustado sobre 3.487 ejemplos con objetivos verificados automaticamente. El modelo no declara ventana de contexto ni idiomas oficiales, y su alcance esta explicitamente acotado a este design system, su catalogo de 55 componentes y peticiones similares a las 250 de su conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-4-E2B-it`); detalles especificos no disponibles |
| Parametros totales | 5,1 B (segun la model card; las dos tablas de vocabulario representan el 54 %) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante funcional; int4 destruyo el ajuste fino). Existe una version a plena precision en servidor |
| Idiomas soportados | no disponible (entrenado y evaluado en ingles; no disenado para idiomas inusuales ni Unicode complejo) |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base `google/gemma-4-E2B-it` (Apache-2.0), un transformer decoder-only de la familia Gemma 4. La model card reporta 5,1 B de parametros totales, de los cuales las dos tablas de vocabulario constituyen el 54 %. Tras el ajuste, el vocabulario se recorto desde 262.144 entradas hasta 32.768 para reducir el tamano del artefacto y permitir que quepa en el entorno de navegador; segun el autor, el recorte preserva exactamente la tokenizacion sobre el corpus de entrenamiento y evaluacion (16.648 textos re-tokenizados con cero discrepancias), pero el texto muy alejado de esa distribucion se fragmenta en mas piezas que con el modelo original.

El ajuste fino se realizo sobre 3.487 ejemplos cuyos objetivos fueron verificados por maquina para requerir cero reparaciones. Se menciona un proceso de mezcla (merge) posterior al entrenamiento. La exportacion final es a int8; todas las variantes int4 probadas degradaron el ajuste. No se documentan en la informacion disponible detalles sobre volumen total de tokens de entrenamiento, composicion del dataset, ni el uso de RLHF o DPO.

## Capacidades

- Generacion de interfaces: produce layouts A2UI en JSON a partir de descripciones en ingles, referenciando componentes del catalogo Altitude por su nombre de etiqueta real.
- Fidelidad al catalogo: utiliza 53 de los 55 componentes disponibles; nunca ha inventado un componente inexistente en ningun checkpoint.
- Salida estructurada validada: genera JSON valido con arbol de layout coherente (sin ids duplicados, referencias colgantes ni nodos huerfanos) en el 100 % de las 250 peticiones evaluadas.
- Ejecucion on-device: inferencia local en navegador (WebGPU), Android y CLI de LiteRT-LM, sin servidor ni conexion de red.
- Decodificacion determinista: el ejemplo de uso emplea muestreo greedy (`top_k=1`).
- No dispone de capacidades declaradas de tool calling, function calling, vision, audio, thinking mode ni razonamiento multi-paso.

## Casos de uso

- Generacion de UI en el navegador: aplicaciones web que permiten al usuario describir en lenguaje natural la pantalla que necesita y renderizan el layout resultante con la libreria de componentes Altitude, todo sin salir del navegador.
- Prototipado rapido de interfaces: un disenador escribe "un panel de ajustes con pestanas de cuenta, notificaciones y seguridad" y obtiene un esqueleto de layout valido sobre el design system, que luego refina manualmente.
- Asistentes de diseno integrados en herramientas internas: el modelo actua como generador de scaffolds de componentes para equipos que ya usan Altitude, reduciendo el trabajo repetitivo de composicion de layouts.
- Agentes que construyen interfaces (protocolo A2UI): integrado en un host compatible con A2UI (por ejemplo, mediante `a2ui-bridge`), permite que un agente genere pantallas reales sobre un sistema de diseno existente en lugar de HTML generico.
- Aplicaciones con requisitos de privacidad: al ejecutarse integramente en local, encaja en escenarios donde las descripciones de interfaz o los datos asociados no pueden salir del dispositivo.
- Pantallas de configuracion de dispositivos: generar formularios y paneles de ajustes (termostatos, dispositivos IoT, apps de configuracion) descritos en lenguaje natural, como ilustra el ejemplo de la propia model card.
- Generacion de formularios y flujos administrativos: crear layouts con campos, pestanas y botones a partir de requisitos textuales en aplicaciones internas de gestion.
- Herramientas de documentacion y catalogos de componentes: producir ejemplos de uso de los componentes Altitude de forma automatizada para documentacion viva del design system.

## Benchmarks y rendimiento

Evaluacion sobre 250 peticiones reservadas, nunca vistas en entrenamiento, puntuadas por el guardrail de Altitude. Un "aprobado" implica que la salida no necesito ninguna reparacion: JSON valido, todos los componentes y propiedades reales, y un arbol de layout coherente.

| Modelo | Correcto al primer intento | Salida valida | Componentes inventados |
|---|---|---|---|
| Este archivo (int8, LiteRT-LM/WebGPU) | 240 / 250 (96,0 %) | 250 / 250 | ninguno |
| Mismo modelo, plena precision, en servidor | 239 / 250 | 250 / 250 | ninguno |
| Gemma 4 E2B sin entrenar | 0 / 250 | 207 / 250 | 4,0 % de las respuestas |

Los 10 fallos restantes del modelo ajustado se describen como errores de "contabilidad" mas que de comprension: contenido repetido, una referencia de padre duplicada y un id reutilizado.

## Requisitos de hardware

- Tamano del artefacto: 2,14 GiB en un unico archivo int8.
- Memoria en navegador: aproximadamente 3 GB de memoria del navegador (el limite practico del entorno ronda los 3,3 GB).
- GPU: requiere WebGPU. En el ejemplo se usa el backend GPU de LiteRT-LM (`litert_lm.Backend.GPU`).
- Compatibilidad en navegador: funciona en un portatil actual; no funciona en el navegador de un telefono.
- Latencia: mediana de 35 segundos por peticion en un Apple M1 con 16 GB. Se recomienda hacer streaming de la salida para no bloquear la pagina.
- Cabe en GPU de consumo: si, siempre que el entorno soporte WebGPU y disponga de suficiente memoria; el cuello de botella es la memoria del navegador, no la VRAM de una GPU dedicada.
- Opciones de despliegue: LiteRT-LM (navegador via WebGPU, Android y linea de comandos). No se mencionan vLLM, llama.cpp o TGI para este artefacto.
- En navegador, el archivo se coloca en el heap de WASM en lugar de transmitirse en streaming, porque la ruta por defecto del runtime rechaza un `.litertlm` ordinario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (250 peticiones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `southleft/altitude-a2ui-e2b-litertlm` (int8) | 5,1 B (vocabulario recortado a 32.768) | no disponible | 240/250 al primer intento; 250/250 validas | apache-2.0 | HuggingFace, formato `.litertlm` |
| Mismo ajuste a plena precision (servidor) | 5,1 B | no disponible | 239/250 al primer intento; 250/250 validas | apache-2.0 | no publicado como repositorio en la informacion disponible |
| `google/gemma-4-E2B-it` (base sin entrenar) | 5,1 B (segun la model card) | no disponible | 0/250 al primer intento; 207/250 validas; 4,0 % de componentes inventados | apache-2.0 | HuggingFace |
| Otros modelos especificos de generacion de UI (generative UI) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance muy acotado: la garantia de fidelidad se refiere unicamente al design system Altitude, su catalogo de 55 componentes y peticiones similares a las 250 evaluadas. No es una afirmacion sobre interfaces arbitrarias ni sobre otros design systems.
- Requiere verificacion: aproximadamente una de cada veinte respuestas necesita el guardrail. El modelo no sustituye a un validador.
- Salida no ejecutable: el modelo solo emite JSON descriptivo; el host debe renderizarlo con su propia libreria de componentes.
- Idiomas y Unicode: el recorte de vocabulario degrada la tokenizacion fuera de la distribucion de entrenamiento. Se recomienda limitarlo a prosa en ingles sobre interfaces; los idiomas inusuales y el Unicode complejo quedan fuera de su proposito.
- Cuantizacion: solo funciona en int8; int4 destruyo el ajuste fino, lo que limita la reduccion de memoria.
- Latencia alta: 35 segundos por peticion de mediana en un M1 implica que no es apto para interacciones en tiempo real sin streaming.
- Restricciones de entorno: exige WebGPU y unos 3 GB de memoria de navegador; no funciona en navegadores moviles.
- Datos no especificados: no se documentan sesgos conocidos, composicion del dataset, volumen de tokens de entrenamiento ni estrategia de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo o alucinacion fuera del dominio de interfaces.
- Licencia: Apache-2.0, heredada del modelo base, lo que permite uso comercial; conviene verificar los terminos del modelo subyacente y de los componentes del design system utilizados en la salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/southleft/altitude-a2ui-e2b-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Design system Altitude (Southleft): https://southleft.com/tools/altitude/
- Repositorio Altitude en GitHub: https://github.com/southleft/altitude
- Protocolo A2UI (Google): https://github.com/google/A2UI
- A2UI Bridge (adaptadores, incluida implementacion en React): https://github.com/southleft/a2ui-bridge
- Demo de A2UI Bridge: https://a2ui.southleft.com/
- Southleft (autor): https://southleft.com/
